import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

const FIREBASE_API_KEY        = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN    = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const FIREBASE_PROJECT_ID     = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const FIREBASE_SENDER_ID      = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const FIREBASE_APP_ID         = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

/** Returns true only when all required Firebase env vars are present. */
export function isFirebaseConfigured(): boolean {
  return !!(
    FIREBASE_API_KEY &&
    FIREBASE_PROJECT_ID &&
    FIREBASE_SENDER_ID &&
    FIREBASE_APP_ID &&
    !FIREBASE_API_KEY.includes("MOCK")
  );
}

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;

  if (getApps().length) return getApp();

  app = initializeApp({
    apiKey:            FIREBASE_API_KEY!,
    authDomain:        FIREBASE_AUTH_DOMAIN,
    projectId:         FIREBASE_PROJECT_ID!,
    storageBucket:     FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_SENDER_ID!,
    appId:             FIREBASE_APP_ID!,
  });

  return app;
}

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  try {
    if (typeof window === "undefined") return null;
    if (!isFirebaseConfigured()) {
      // Firebase not configured — push notifications disabled
      return null;
    }
    if (!(await isSupported())) return null;

    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;

    return getMessaging(firebaseApp);
  } catch (err) {
    console.warn("[Firebase] Messaging not available:", err);
    return null;
  }
};
