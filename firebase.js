import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Add if you need Firestore later
// import { getAnalytics } from "firebase/analytics"; // Add if you need Analytics later

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlUt7XSws9DENx4Op1eAZZWB_4ZBvqq6Q",
  authDomain: "glidepay-ff016.firebaseapp.com",
  projectId: "glidepay-ff016",
  storageBucket: "glidepay-ff016.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "584226594692",
  appId: "1:584226594692:web:62d600b51b4beadf9687d1",
  measurementId: "G-5Y120ZZSCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const db = getFirestore(app); // Add if you need Firestore
// const analytics = getAnalytics(app); // Add if you need Analytics

export { auth }; // Export auth instance
// export { db }; // Export db if needed
