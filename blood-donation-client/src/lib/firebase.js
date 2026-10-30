import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABal6qOU940H4S1wsntgSH-H1mepbrYd4",
  authDomain: "bloodlink-aa91d.firebaseapp.com",
  projectId: "bloodlink-aa91d",
  storageBucket: "bloodlink-aa91d.firebasestorage.app",
  messagingSenderId: "188744086767",
  appId: "1:188744086767:web:5ef5695423328f31b6d71a",
  measurementId: "G-6M67NDYBW0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);