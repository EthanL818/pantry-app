// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "pantry-app-84466.firebaseapp.com",
  projectId: "pantry-app-84466",
  storageBucket: "pantry-app-84466.appspot.com",
  messagingSenderId: "1090261504687",
  appId: "1:1090261504687:web:0654e4a66325175c823a5a",
  measurementId: "G-MMPM11S83S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };
