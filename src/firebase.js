import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAzrk_gSTVwpVDwxQAn04BoJIVj-33mADI",
  authDomain: "timestamp-45f41.firebaseapp.com",
  projectId: "timestamp-45f41",
  storageBucket: "timestamp-45f41.appspot.com",
  messagingSenderId: "685693403155",
  appId: "1:685693403155:web:d3a919c6149bf2dbd4bfe6",
  measurementId: "G-WPY90DQG7F"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
