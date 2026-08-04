"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseInitialized = exports.getMessaging = void 0;
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
Object.defineProperty(exports, "getMessaging", { enumerable: true, get: function () { return messaging_1.getMessaging; } });
let isFirebaseInitialized = false;
exports.isFirebaseInitialized = isFirebaseInitialized;
try {
    if (!(0, app_1.getApps)().length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n");
        if (projectId && clientEmail && privateKey) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            exports.isFirebaseInitialized = isFirebaseInitialized = true;
            console.log("[FirebaseAdmin] Successfully initialized Firebase Admin SDK");
        }
        else {
            console.warn("[FirebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY. Running in dry-run mode.");
        }
    }
    else {
        exports.isFirebaseInitialized = isFirebaseInitialized = true;
    }
}
catch (err) {
    console.error("[FirebaseAdmin] Initialization error:", err);
}
