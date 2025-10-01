// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq4nEy_JYGWd0NecU9zjV87wPy47kyb6k",
  authDomain: "task-tracker-8e573.firebaseapp.com",
  projectId: "task-tracker-8e573",
  storageBucket: "task-tracker-8e573.firebasestorage.app",
  messagingSenderId: "452554154575",
  appId: "1:452554154575:web:1c49c13c131a4aad0f403a",
  measurementId: "G-Y36FNYGB6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;