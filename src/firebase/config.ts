import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyA40vANcCfsZammP-Z2tzeHObJjJSJzyNw",
  authDomain: "ascom-4118d.firebaseapp.com",
  projectId: "ascom-4118d",
  storageBucket: "ascom-4118d.firebasestorage.app",
  messagingSenderId: "824870651936",
  appId: "1:824870651936:web:48839ccd6a758f7d7cd445",
  measurementId: "G-SK7WNSPRYM"
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId);
