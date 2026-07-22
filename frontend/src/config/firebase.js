import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGBNJtJimRVrZQzcRh3GLeuQf9RJ7L4hw",
  authDomain: "bookstore-e9cdd.firebaseapp.com",
  projectId: "bookstore-e9cdd",
  storageBucket: "bookstore-e9cdd.firebasestorage.app",
  messagingSenderId: "512014798037",
  appId: "1:512014798037:web:94eb2a53f79bbef13ae65c",
  measurementId: "G-0BYMH9YMR5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
