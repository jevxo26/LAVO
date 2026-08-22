"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAppSelector } from "@/store/store";

export function PushNotificationInitializer() {
  const { permission, requestPermission } = usePushNotifications();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Prompt for notification permission automatically if logged in and permission is default
    if (isAuthenticated && permission === "default") {
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, permission, requestPermission]);

  return null;
}
