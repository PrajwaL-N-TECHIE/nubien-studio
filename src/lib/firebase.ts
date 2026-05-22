import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDgrnbifK4MfZCjeieBZmXRzerGTHSvh8o",
  authDomain: "buildicy-internships.firebaseapp.com",
  projectId: "buildicy-internships",
  storageBucket: "buildicy-internships.firebasestorage.app",
  messagingSenderId: "147546049319",
  appId: "1:147546049319:web:3e45f7973cbcee7f88f702",
  measurementId: "G-PE6NBGDL8K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
