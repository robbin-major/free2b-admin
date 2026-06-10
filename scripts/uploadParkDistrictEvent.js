require("dotenv").config();

const axios = require("axios");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyABVZ6MAkbQlWylUiyRPbtf6PbIAU2y-gY",
  authDomain: "free2b-b6221.firebaseapp.com",
  projectId: "free2b-b6221",
  storageBucket: "free2b-b6221.appspot.com",
  messagingSenderId: "1039187320593",
  appId: "1:1039187320593:web:1be9fd30c467226092b6b0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DATA_URL = "https://data.cityofchicago.org/resource/tn7v-6rnw.json";

const PARK_DISTRICT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/free2b-b6221.appspot.com/o/file%2FScreen%20Shot%202026-04-20%20at%2011.54.46%20PM.png1776752667201?alt=media&token=27883c26-1bac-470d-a937-8b1bc3e15a60";

const PARK_DISTRICT_CATEGORY = {
  categoryId: "3nrKkVtQTUFY32R5ykY8",
  categoryName: "Chicago Parks District",
};

function formatParkDistrictDate(dateString) {
  const eventDate = new Date(dateString);

  const formattedDate = eventDate
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    formattedDate,
    formattedTime,
    formattedStartDate: `${formattedDate} ${formattedTime}`,
  };
}

function isFreeActiveEvent(event) {
  const fee = Number(event.fee || 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(event.start_date);

  return fee === 0 && startDate >= today;
}

function cleanDescription(event) {
  return [
    "Free Chicago Park District Event",
    event.description || "",
    event.date_notes || "",
    event.age_range ? `Age range: ${event.age_range}` : "",
    event.information_link?.url || "",
  ].filter(Boolean);
}

async function reverseGeocode(location) {
  if (!location?.coordinates) {
    return null;
  }

  const [lon, lat] = location.coordinates;

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "jsonv2",
          lat,
          lon,
        },
        headers: {
          "User-Agent": "Free2B event importer robbin.major@gmail.com",
        },
      }
    );

    const address = response.data.address || {};

    return {
      address: [address.house_number, address.road]
        .filter(Boolean)
        .join(" "),
      city: address.city || "Chicago",
      state: address.state || "Illinois",
      zipCode: address.postcode || "",
      country: address.country || "United States",
      fullAddress: response.data.display_name || "",
    };
  } catch (error) {
    console.log("Reverse geocode failed:", error.message);
    return null;
  }
}

async function alreadyUploaded(sourceId) {
  const eventRef = collection(db, "event");
  const q = query(
    eventRef,
    where("source", "==", "Chicago Park District"),
    where("sourceId", "==", sourceId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function getFreeUpcomingEvents() {
  const response = await axios.get(DATA_URL, {
    params: {
      $limit: 1000,
      $order: "end_date ASC",
    },
  });

  return response.data.filter(isFreeActiveEvent).slice(0, 100);
}

function buildEventData(parkEvent, locationData) {
  const realStart = new Date(parkEvent.start_date);
  const nextDate = new Date();
  nextDate.setHours(realStart.getHours(), realStart.getMinutes(), 0, 0);

const { formattedDate, formattedTime, formattedStartDate } =
  formatParkDistrictDate(parkEvent.start_date);

  return {
    createdAt: new Date().getTime(),

    source: "Chicago Park District",
    sourceId: parkEvent.activity_id,

    startDate: formattedStartDate,
    startDateCheck: formattedDate,
    startTimeCheck: formattedTime,

    title: parkEvent.title,

    description: cleanDescription(parkEvent),

    type: "Citywide Event",
    categoryType: "Citywide Event",

    category: [PARK_DISTRICT_CATEGORY],

    address: locationData?.address || "Chicago Park District",
    city: locationData?.city || "Chicago",
    state: locationData?.state || "Illinois",
    country: locationData?.country || "United States",
    zipCode: locationData?.zipCode || "",

    image: PARK_DISTRICT_IMAGE,

    uid: "free2b-automation",

    status: "APPROVAL",
  };
}

async function uploadEvents() {
  try {
    await signInWithEmailAndPassword(
      auth,
      process.env.FREE2B_EMAIL,
      process.env.FREE2B_PASSWORD
    );

    console.log("Logged into Firebase.");

    const events = await getFreeUpcomingEvents();

    if (!events.length) {
      console.log("No upcoming free events found.");
      return;
    }

    console.log(`Found ${events.length} upcoming free events.`);

    let uploadedCount = 0;
    let skippedCount = 0;

    for (const parkEvent of events) {
      const sourceId = parkEvent.activity_id;

      if (await alreadyUploaded(sourceId)) {
        console.log(`SKIPPED duplicate: ${parkEvent.title}`);
        skippedCount++;
        continue;
      }

      const locationData = await reverseGeocode(parkEvent.location);

      const eventData = buildEventData(parkEvent, locationData);

      const response = await addDoc(collection(db, "event"), eventData);

      await updateDoc(doc(db, "event", response.id), {
        evntId: response.id,
      });

      console.log(`UPLOADED: ${parkEvent.title}`);
      console.log(`Address: ${eventData.address}, ${eventData.city}, ${eventData.state} ${eventData.zipCode}`);
      console.log(`ID: ${response.id}`);

      uploadedCount++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("DONE.");
    console.log(`Uploaded: ${uploadedCount}`);
    console.log(`Skipped: ${skippedCount}`);
  } catch (error) {
    console.error("UPLOAD ERROR:");
    console.error(error.response?.data || error.message);
  }
}

uploadEvents();