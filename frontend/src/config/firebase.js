import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfHREEdjxkJXleNnUx-jy50qrq4ZmZL5s",
  authDomain: "yiyi-bookstore.firebaseapp.com",
  projectId: "yiyi-bookstore",
  storageBucket: "yiyi-bookstore.firebasestorage.app",
  messagingSenderId: "1094608248618",
  appId: "1:1094608248618:web:cbf6555f8bbf79ca2dc853",
  measurementId: "G-ZF3ZR1WXSG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
