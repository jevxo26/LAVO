"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging, isFirebaseConfigured } from "@/lib/firebase";
import { toast } from "sonner";

export interface PushNotificationState {
  permission: NotificationPermission;
  fcmToken: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
}

export function usePushNotifications(): PushNotificationState {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If Firebase is not configured, return a no-op state immediately
  const firebaseReady = isFirebaseConfigured();

  const registerTokenWithBackend = async (token: string) => {
    try {
      const authToken =
        typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      if (!authToken) return;

      const res = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        console.log("[usePushNotifications] Token registered with backend.");
      }
    } catch (err) {
      console.error("[usePushNotifications] Error registering token:", err);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;

    // Firebase not configured — skip silently
    if (!firebaseReady) return false;

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          try {
            const token = await getToken(messaging, { vapidKey });
            if (token) {
              setFcmToken(token);
              await registerTokenWithBackend(token);
              toast.success("Push notifications enabled!");
              return true;
            }
          } catch (tokenErr: any) {
            // AbortError means the push service rejected the subscription
            // (invalid VAPID key, bad Firebase config, etc.)
            console.warn("[usePushNotifications] Could not get FCM token:", tokenErr?.message);
          }
        }
      } else {
        toast.info("Notification permission was denied.");
      }
    } catch (err: any) {
      console.error("[usePushNotifications] Error requesting permission:", err);
    } finally {
      setIsLoading(false);
    }
    return false;
  }, [firebaseReady]);

  // Auto-register on mount if permission was previously granted
  useEffect(() => {
    if (!firebaseReady) return;

    const autoRegister = async () => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const messaging = await getFirebaseMessaging();
          if (messaging) {
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            const token = await getToken(messaging, { vapidKey });
            if (token) {
              setFcmToken(token);
              await registerTokenWithBackend(token);
            }
          }
        } catch (err: any) {
          // Suppress AbortError / network errors silently
          console.warn("[usePushNotifications] Auto-register skipped:", err?.message);
        }
      }
    };

    autoRegister();
  }, [firebaseReady]);

  // Foreground message listener
  useEffect(() => {
    if (!firebaseReady || permission !== "granted") return;

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || payload.data?.title || "LAVO Update";
          const body  = payload.notification?.body  || payload.data?.body  || "You have a new update.";
          toast.info(title, { description: body, duration: 6000 });
        });
      }
    };

    setupListener();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [permission, firebaseReady]);

  return { permission, fcmToken, isLoading, requestPermission };
}
