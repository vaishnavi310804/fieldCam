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
    if (isAuthenticated && user) {
      initializeNotifications().then((token) => {
        if (token) {
          console.log(`[FCM Lifecycle] Token active for user ${user._id}:`, token);
        }
      });

      const unsubscribe = onTokenRefresh((newToken) => {
        console.log(`[FCM Lifecycle] Token refreshed for user ${user._id}:`, newToken);
        registerDeviceTokenWithBackend(newToken);
      });

      return () => {
        unsubscribe();
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

