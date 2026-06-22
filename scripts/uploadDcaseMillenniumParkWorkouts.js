const crypto = require("crypto");
const fs = require("fs");

const SOURCE_URL =
  "https://www.chicago.gov/city/en/depts/dca/supp_info/millennium_park_workouts.html";
const CHICAGO_GOV_ORIGIN = "https://www.chicago.gov";

const DEFAULT_ADDRESS = {
  address: "201 E Randolph St",
  city: "Chicago",
  state: "Illinois",
  zipCode: "60602",
  country: "United States",
};

const DCASE_CATEGORY = {
  categoryId: "dcase",
  categoryName: "DCASE",
};

const dryRun = process.argv.includes("--dry-run");
const includePast = process.argv.includes("--include-past");
const htmlFileArg = process.argv.find((arg) => arg.startsWith("--html-file="));
const htmlFile = htmlFileArg ? htmlFileArg.split("=").slice(1).join("=") : "";

let auth;
let db;
let firebaseFns;

function initializeFirebase() {
  if (firebaseFns) {
    return;
  }

  require("dotenv").config();

  const { initializeApp } = require("firebase/app");
  const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
  const firestore = require("firebase/firestore");

  const firebaseConfig = {
    apiKey: "AIzaSyABVZ6MAkbQlWylUiyRPbtf6PbIAU2y-gY",
    authDomain: "free2b-b6221.firebaseapp.com",
    projectId: "free2b-b6221",
    storageBucket: "free2b-b6221.appspot.com",
    messagingSenderId: "1039187320593",
    appId: "1:1039187320593:web:1be9fd30c467226092b6b0",
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = firestore.getFirestore(app);
  firebaseFns = {
    signInWithEmailAndPassword,
    ...firestore,
  };
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&reg;/g, "")
    .replace(/&#169;/g, "(c)")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(url) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${CHICAGO_GOV_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractPageHeroImage(html) {
  const heroMatch = html.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
  return absoluteUrl(heroMatch?.[1] || "");
}

function extractPageDescription(html) {
  const metaMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  const introMatch = html.match(
    /<p>The workout program takes place[\s\S]*?<\/p>/i
  );

  return decodeHtml(introMatch?.[0] || metaMatch?.[1] || "");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableSourceId({ dateLabel, startTime, title }) {
  const raw = `${SOURCE_URL}|${dateLabel}|${startTime}|${title}`;
  const hash = crypto.createHash("sha1").update(raw).digest("hex").slice(0, 10);
  return `dcase-millennium-park-workouts-${slugify(dateLabel)}-${slugify(startTime)}-${slugify(title)}-${hash}`;
}

function parseDateLabel(dateLabel) {
  const parsed = new Date(`${dateLabel} 00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unable to parse date: ${dateLabel}`);
  }

  return parsed;
}

function formatDateParts(date) {
  const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");

  return {
    formattedDate,
    formattedStartDate: `${formattedDate}`,
  };
}

function normalizeTimePart(timePart, meridiem) {
  const [hourValue, minuteValue = "00"] = timePart.trim().split(":");
  let hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (meridiem === "p.m." && hour < 12) {
    hour += 12;
  }

  if (meridiem === "a.m." && hour === 12) {
    hour = 0;
  }

  const date = new Date(2000, 0, 1, hour, minute, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseTimeRange(rawTimeRange) {
  const normalized = decodeHtml(rawTimeRange)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const match = normalized.match(
    /^(\d{1,2}(?::\d{2})?)\s*-\s*(\d{1,2}(?::\d{2})?)\s*(a\.m\.|p\.m\.)$/
  );

  if (!match) {
    throw new Error(`Unable to parse time range: ${rawTimeRange}`);
  }

  return {
    startTime: normalizeTimePart(match[1], match[3]),
    endTime: normalizeTimePart(match[2], match[3]),
  };
}

function todayInChicago() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
}

function titleFromListItem(text) {
  const withoutTime = text
    .replace(
      /^\d{1,2}(?::\d{2})?\s*-\s*\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.)\s*-\s*/i,
      ""
    )
    .trim();
  const match = withoutTime.match(/^(.+?)(?:\s+with\s+|$)/i);
  const workoutName = decodeHtml(match?.[1] || withoutTime);
  return `Millennium Park Summer Workouts: ${workoutName}`;
}

function parseScheduleCards(html) {
  const scheduleStart = html.indexOf("Schedule");
  const scheduleHtml = scheduleStart >= 0 ? html.slice(scheduleStart) : html;
  const cardRegex =
    /<div class="card-header h4\s*">\s*([^<]+)\s*<\/div>[\s\S]*?<div class="card-text">([\s\S]*?)<\/div>/g;

  const cards = [];
  let cardMatch;

  while ((cardMatch = cardRegex.exec(scheduleHtml)) !== null) {
    const dateLabel = decodeHtml(cardMatch[1]);
    const cardBody = cardMatch[2];
    const locationMatch = cardBody.match(/<p><strong>([\s\S]*?)<\/strong><\/p>/i);
    const location = decodeHtml(locationMatch?.[1] || "Millennium Park");
    const itemMatches = [...cardBody.matchAll(/<li>([\s\S]*?)<\/li>/g)];

    cards.push({
      dateLabel,
      location,
      items: itemMatches.map((itemMatch) => itemMatch[1]),
    });
  }

  return cards;
}

function extractEvents(html) {
  const image = extractPageHeroImage(html);
  const pageDescription = extractPageDescription(html);
  const today = todayInChicago();

  return parseScheduleCards(html).flatMap((card) => {
    const eventDate = parseDateLabel(card.dateLabel);

    return card.items
      .map((itemHtml) => {
        const itemText = decodeHtml(itemHtml);
        const timeMatch = itemText.match(
          /^(\d{1,2}(?::\d{2})?\s*-\s*\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.))/i
        );

        if (!timeMatch) {
          throw new Error(`Missing time range in item: ${itemText}`);
        }

        const { startTime, endTime } = parseTimeRange(timeMatch[1]);
        const { formattedDate } = formatDateParts(eventDate);
        const title = titleFromListItem(itemText);
        const sourceId = stableSourceId({
          dateLabel: card.dateLabel,
          startTime,
          title,
        });

        return {
          sourceId,
          source: "DCASE",
          date: eventDate,
          dateLabel: card.dateLabel,
          startDate: `${formattedDate} ${startTime}`,
          startDateCheck: formattedDate,
          startTimeCheck: startTime,
          endTimeCheck: endTime,
          title,
          location: card.location,
          image,
          description: [
            "Free DCASE event",
            pageDescription,
            `${card.dateLabel}, ${startTime} - ${endTime}`,
            `Location: ${card.location}, Millennium Park`,
            itemText,
            SOURCE_URL,
          ].filter(Boolean),
        };
      })
      .filter((event) => includePast || event.date >= today);
  });
}

function buildEventData(dcaseEvent) {
  return {
    createdAt: new Date().getTime(),

    source: dcaseEvent.source,
    sourceId: dcaseEvent.sourceId,
    sourceUrl: SOURCE_URL,

    startDate: dcaseEvent.startDate,
    startDateCheck: dcaseEvent.startDateCheck,
    startTimeCheck: dcaseEvent.startTimeCheck,
    endTimeCheck: dcaseEvent.endTimeCheck,

    title: dcaseEvent.title,
    description: dcaseEvent.description,

    type: "Citywide Event",
    categoryType: "Citywide Event",
    category: [DCASE_CATEGORY],

    venueName: "Millennium Park",
    location: dcaseEvent.location,
    address: DEFAULT_ADDRESS.address,
    city: DEFAULT_ADDRESS.city,
    state: DEFAULT_ADDRESS.state,
    country: DEFAULT_ADDRESS.country,
    zipCode: DEFAULT_ADDRESS.zipCode,

    image: dcaseEvent.image,
    price: "FREE",
    isFree: true,

    uid: "free2b-automation",
    status: "APPROVAL",
  };
}

async function alreadyUploaded(sourceId) {
  const eventRef = firebaseFns.collection(db, "event");
  const q = firebaseFns.query(
    eventRef,
    firebaseFns.where("source", "==", "DCASE"),
    firebaseFns.where("sourceId", "==", sourceId)
  );

  const snapshot = await firebaseFns.getDocs(q);
  return !snapshot.empty;
}

async function fetchScheduleHtml() {
  if (htmlFile) {
    return fs.readFileSync(htmlFile, "utf8");
  }

  const response = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent": "Free2B DCASE importer robbin.major@gmail.com",
    },
  });

  if (!response.ok) {
    throw new Error(`DCASE page request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function uploadEvents() {
  let uploadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const missingFields = new Set();

  if (!dryRun) {
    initializeFirebase();

    await firebaseFns.signInWithEmailAndPassword(
      auth,
      process.env.FREE2B_EMAIL,
      process.env.FREE2B_PASSWORD
    );

    console.log("Logged into Firebase.");
  }

  const html = await fetchScheduleHtml();
  const events = extractEvents(html);

  console.log(
    `Found ${events.length} ${includePast ? "total" : "upcoming"} DCASE workout events.`
  );
  console.log(`Mode: ${dryRun ? "DRY RUN - no Firestore writes" : "UPLOAD"}`);

  for (const event of events) {
    try {
      const eventData = buildEventData(event);

      ["title", "startDate", "address", "description", "sourceId"].forEach(
        (field) => {
          if (!eventData[field] || eventData[field].length === 0) {
            missingFields.add(field);
          }
        }
      );

      if (dryRun) {
        console.log(`DRY RUN: ${eventData.startDate} - ${eventData.title}`);
        uploadedCount++;
        continue;
      }

      if (await alreadyUploaded(eventData.sourceId)) {
        console.log(`SKIPPED duplicate: ${eventData.title} (${eventData.startDate})`);
        skippedCount++;
        continue;
      }

      const response = await firebaseFns.addDoc(
        firebaseFns.collection(db, "event"),
        eventData
      );

      await firebaseFns.updateDoc(firebaseFns.doc(db, "event", response.id), {
        evntId: response.id,
      });

      console.log(`UPLOADED: ${eventData.title}`);
      console.log(`Date: ${eventData.startDate}`);
      console.log(
        `Address: ${eventData.address}, ${eventData.city}, ${eventData.state} ${eventData.zipCode}`
      );
      console.log(`ID: ${response.id}`);

      uploadedCount++;
    } catch (error) {
      failedCount++;
      console.error(`FAILED: ${event.title || event.sourceId}`);
      console.error(error.response?.data || error.message);
    }
  }

  console.log("DONE.");
  console.log(`${dryRun ? "Would upload" : "Uploaded"}: ${uploadedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(
    `Missing fields: ${missingFields.size ? [...missingFields].join(", ") : "none"}`
  );
}

uploadEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("UPLOAD ERROR:");
    console.error(error.response?.data || error.message);
    process.exit(1);
  });
