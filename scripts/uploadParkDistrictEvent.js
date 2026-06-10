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

async function getOneFreeEvent() {
  const response = await axios.get(DATA_URL, {
    params: {
      $limit: 20,
      $order: "start_date ASC",
    },
  });

  return response.data.find((event) => Number(event.fee || 0) === 0);
}

async function uploadEvent() {
  try {
    await signInWithEmailAndPassword(
      auth,
      process.env.FREE2B_EMAIL,
      process.env.FREE2B_PASSWORD
    );

    console.log("Logged into Firebase.");

    const parkEvent = await getOneFreeEvent();

    if (!parkEvent) {
      console.log("No free event found.");
      return;
    }

    const { formattedDate, formattedTime, formattedStartDate } =
      formatParkDistrictDate(parkEvent.start_date);

    const eventData = {
      createdAt: new Date().getTime(),

      startDate: "21-05-2026 10:00 AM",
      startDateCheck: "21-05-2026" ,
      startTimeCheck: "10:00 AM",

      title: parkEvent.title,

      description: [
        "Free Chicago Park District Event",
        parkEvent.description || "",
        parkEvent.date_notes || "",
        parkEvent.information_link?.url || "",
      ],

      type: "Citywide Event",
      categoryType: "Citywide Event",

      category: [
        {
          categoryId: "3nrKkVtQTUFY32R5ykY8",
          categoryName: "Chicago Parks District",
        },
      ],

      city: "Chicago",
      state: "Illinois",
      country: "United States",
      zipCode: "60609",
      address: "704 W 42nd St",

      image:
        "https://firebasestorage.googleapis.com/v0/b/free2b-b6221.appspot.com/o/file%2FScreen%20Shot%202026-04-21%20at%201.31.13%20AM.png1776753313606?alt=media&token=d7cb4c0b-3165-4a9d-b8a3-2ba18f84ca6c",

      uid: "rgBipis6paQqZaR0l0ItnQwEy2L2",

      source: "Chicago Park District",
      status: "APPROVAL",
    };

    const response = await addDoc(collection(db, "event"), eventData);

    await updateDoc(doc(db, "event", response.id), {
      evntId: response.id,
    });

    console.log("SUCCESS!");
    console.log("Uploaded event ID:", response.id);
  } catch (error) {
    console.error("UPLOAD ERROR:");
    console.error(error.message);
  }
}

uploadEvent();