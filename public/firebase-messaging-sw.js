importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_LAUNDRIX_API_KEY",
  authDomain: "laundrix-push.firebaseapp.com",
  projectId: "laundrix-push",
  storageBucket: "laundrix-push.appspot.com",
  messagingSenderId: "102938475612",
  appId: "1:102938475612:web:a1b2c3d4e5f6",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background FCM message:", payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || "LAUNDRIX Update";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "You have a new notification from LAUNDRIX.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
