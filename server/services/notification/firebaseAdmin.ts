import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let isFirebaseInitialized = false;

try {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseInitialized = true;
      console.log("[FirebaseAdmin] Successfully initialized Firebase Admin SDK");
    } else {
      console.warn(
        "[FirebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY. Running in dry-run mode."
      );
    }
  } else {
    isFirebaseInitialized = true;
  }
} catch (err) {
  console.error("[FirebaseAdmin] Initialization error:", err);
}

export { getMessaging, isFirebaseInitialized };
