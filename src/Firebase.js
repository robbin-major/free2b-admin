// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDwTrVlaaHWDfJ6Wd45waVwpxxC7FENYCg",
    authDomain: "free2b-b6221.firebaseapp.com",
    projectId: "free2b-b6221",
    storageBucket: "free2b-b6221.appspot.com",
    messagingSenderId: "1039187320593",
    appId: "1:1039187320593:web:1be9fd30c467226092b6b0",
    measurementId: "G-PE086NLZYX"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage();
export const functions = getFunctions(app);

export default auth;
