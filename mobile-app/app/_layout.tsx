import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import {
  initializeNotifications,
  onTokenRefresh,
  registerDeviceTokenWithBackend,
  setupBackgroundNotificationHandler,
} from "../src/services/notification.service";

// Register FCM background handler at top level module scope
setupBackgroundNotificationHandler();

const NotificationLifecycle = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let cleanupNotifications: (() => void) | undefined;

    if (isAuthenticated && user) {
      initializeNotifications().then((cleanup) => {
        if (isMounted) {
          cleanupNotifications = cleanup;
          console.log(`[FCM Lifecycle] Notifications active for user ${user._id}`);
        } else if (cleanup) {
          cleanup();
        }
      });

      const unsubscribeRefresh = onTokenRefresh((newToken) => {
        console.log(`[FCM Lifecycle] Token refreshed for user ${user._id}:`, newToken);
        registerDeviceTokenWithBackend(newToken);
      });

      return () => {
        isMounted = false;
        if (cleanupNotifications) {
          cleanupNotifications();
        }
        unsubscribeRefresh();
      };
    }
  }, [isAuthenticated, user]);

  return null;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationLifecycle />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

