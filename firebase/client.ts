// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAa_b6QjLxTiTIJKiKquWkUM_euuSQs89c",
  authDomain: "aceai-f3d2a.firebaseapp.com",
  projectId: "aceai-f3d2a",
  storageBucket: "aceai-f3d2a.firebasestorage.app",
  messagingSenderId: "776261487981",
  appId: "1:776261487981:web:3216799b06218141279e64",
  measurementId: "G-RKDZY6GST7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);