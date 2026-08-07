"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
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

  const registerTokenWithBackend = async (token: string) => {
    try {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
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
        console.log("[usePushNotifications] Token registered with backend successfully");
      }
    } catch (err) {
      console.error("[usePushNotifications] Error registering token with backend:", err);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return false;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          const token = await getToken(messaging, { vapidKey });

          if (token) {
            setFcmToken(token);
            await registerTokenWithBackend(token);
            toast.success("Push notifications enabled!");
            setIsLoading(false);
            return true;
          }
        }
      } else {
        toast.info("Notification permission was denied.");
      }
    } catch (err: any) {
      console.error("[usePushNotifications] Error requesting permission:", err);
      toast.error("Failed to enable push notifications.");
    } finally {
      setIsLoading(false);
    }
    return false;
  }, []);

  // Auto-fetch token and register if permission was previously granted
  useEffect(() => {
    const autoRegisterIfGranted = async () => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
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
        } catch (err) {
          console.warn("[usePushNotifications] Auto-register failed silently:", err);
        }
      }
    };
    autoRegisterIfGranted();
  }, []);

  // Foreground Message Listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("[usePushNotifications] Foreground message received:", payload);
          const title = payload.notification?.title || payload.data?.title || "LAUNDRIX Update";
          const body = payload.notification?.body || payload.data?.body || "You have a new update.";
          toast.info(title, { description: body, duration: 6000 });
        });
      }
    };

    if (permission === "granted") {
      setupForegroundListener();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [permission]);

  return {
    permission,
    fcmToken,
    isLoading,
    requestPermission,
  };
}
