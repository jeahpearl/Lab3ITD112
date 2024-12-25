import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyD9AVyMpAagD2A8gBO8oeF2rD0QEeWJ8fs",
  authDomain: "itd112lab3-f6f06.firebaseapp.com",
  projectId: "itd112lab3-f6f06",
  storageBucket: "itd112lab3-f6f06.firebasestorage.app",
  messagingSenderId: "96528176862",
  appId: "1:96528176862:web:f6adea920830fcfe15944f",
  measurementId: "G-1XT6L7K56T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };