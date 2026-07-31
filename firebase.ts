import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfigData from "./firebase-applet-config.json";

// User provided firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDfqwg21SgvQ1-o3ETQ9IYbLWVsv62pawU",
  authDomain: "bing9ja.firebaseapp.com",
  projectId: "bing9ja",
  storageBucket: "bing9ja.firebasestorage.app",
  messagingSenderId: "383496053791",
  appId: "1:383496053791:web:a31246b6f81e48d609212a",
  measurementId: "G-WH8XDDH3D5"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (handling custom databaseId if provisioned)
const databaseId = (firebaseConfigData as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Initialize Analytics safely (works in browser environments)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in preview iframe sandbox
  });
}
