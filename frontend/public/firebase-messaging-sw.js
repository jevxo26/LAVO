importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// These values are replaced at build time via next.config.js / CI environment.
// If placeholders are still present, the service worker does nothing.
const FIREBASE_API_KEY    = self.__FIREBASE_API_KEY__    || "";
const FIREBASE_PROJECT_ID = self.__FIREBASE_PROJECT_ID__ || "";
const FIREBASE_SENDER_ID  = self.__FIREBASE_SENDER_ID__  || "";
const FIREBASE_APP_ID     = self.__FIREBASE_APP_ID__     || "";

const isConfigured =
  FIREBASE_API_KEY &&
  FIREBASE_PROJECT_ID &&
  FIREBASE_SENDER_ID &&
  FIREBASE_APP_ID &&
  !FIREBASE_API_KEY.includes("MOCK");

if (isConfigured) {
  firebase.initializeApp({
    apiKey:            FIREBASE_API_KEY,
    projectId:         FIREBASE_PROJECT_ID,
    messagingSenderId: FIREBASE_SENDER_ID,
    appId:             FIREBASE_APP_ID,
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle =
      payload.notification?.title || payload.data?.title || "LAVO Update";
    const notificationOptions = {
      body:  payload.notification?.body || payload.data?.body || "You have a new notification.",
      icon:  "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data:  payload.data || {},
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    event.notification.data?.url ||
    event.notification.data?.click_action ||
    "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
