import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== "undefined" && config.apiKey && config.projectId) {
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = null!;
  auth = null!;
  db = null!;
  storage = null!;
}

export { app, auth, db, storage };

const FUNCTIONS_BASE =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ?? "https://us-central1-fb-api-79e8c.cloudfunctions.net";

const FUNCTION_NAMES = [
  "agenda",
  "multimedia",
  "informacion",
  "eventos",
  "registerAdmin",
  "session",
  "oracion",
  "ministerios",
] as const;

function getEnvUrl(name: string): string | undefined {
  const key = `NEXT_PUBLIC_${name.toUpperCase()}_URL`;
  return (process.env as Record<string, string | undefined>)[key];
}

export function getFunctionUrl(name: (typeof FUNCTION_NAMES)[number]): string {
  const envUrl = getEnvUrl(name);
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `${FUNCTIONS_BASE.replace(/\/$/, "")}/${name}`;
}

export const FUNCTIONS_URL = FUNCTIONS_BASE;
