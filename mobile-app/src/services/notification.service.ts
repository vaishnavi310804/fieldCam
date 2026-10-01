import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh as onFcmTokenRefresh,
  setBackgroundMessageHandler,
  AuthorizationStatus,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { PermissionsAndroid, Platform } from "react-native";
import { platformClient } from "../api/platformClient";

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Android 13+ POST_NOTIFICATIONS permission denied.");
        return false;
      }
    }

    const messagingInstance = getMessaging();
    const authStatus = await requestPermission(messagingInstance);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission not granted. Cannot retrieve FCM token.");
      return null;
    }

    const messagingInstance = getMessaging();
    const token = await getToken(messagingInstance);
    return token;
  } catch (error) {
    console.error("Error retrieving FCM device token:", error);
    return null;
  }
};


export const onTokenRefresh = (callback: (token: string) => void) => {
  const messagingInstance = getMessaging();
  return onFcmTokenRefresh(messagingInstance, (token: string) => {
    console.log("FCM Token refreshed:", token);
    callback(token);
  });
};

export const registerDeviceTokenWithBackend = async (
  token: string
): Promise<void> => {
  const platform = Platform.OS === "ios" ? "ios" : "android";
  const maxAttempts = 3;
  const retryDelays = [0, 2000, 4000];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await platformClient.post("/notifications/device-token", {
        deviceToken: token,
        platform,
      });

      console.log(
        `Device token synchronized with backend successfully (attempt ${attempt}).`
      );

      return;
    } catch (error) {
      console.warn(
        `Failed to synchronize device token with backend (attempt ${attempt}/${maxAttempts}):`,
        error
      );

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelays[attempt] ?? 2000)
        );
      }
    }
  }

  console.warn(
    "Device token synchronization failed after all retry attempts."
  );
};

export const unregisterDeviceTokenWithBackend = async (
  token: string
): Promise<void> => {
  try {
    await platformClient.delete("/notifications/device-token", {
      data: { deviceToken: token },
    });
    console.log("Device token unregistered from backend successfully.");
  } catch (error) {
    console.warn("Failed to unregister device token from backend:", error);
  }
};

export const ensureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === "android") {
    const channel = await Notifications.setNotificationChannelAsync("default", {
      name: "FieldCam Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0066CC",
      sound: "default",
    });
    console.log("[Expo Notifications] Default Channel set:", channel);
  }
};

// Immediately initialize default channel at module load time on Android
ensureNotificationChannel().catch((err) =>
  console.warn("Failed to set Android default notification channel:", err)
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupForegroundNotificationHandler = () => {
  const messagingInstance = getMessaging();

  return onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log("Foreground FCM message received:", remoteMessage);

      if (!remoteMessage.notification) {
        return;
      }

      try {
        await ensureNotificationChannel();

        await Notifications.scheduleNotificationAsync({
          content: {
            title:
              remoteMessage.notification.title ||
              "FieldCam Notification",
            body: remoteMessage.notification.body || "",
            data: remoteMessage.data || {},
            sound: "default",
            ...(Platform.OS === "android" && {
              channelId: "default",
            }),
          },
          trigger: null,
        });

        console.log(
          "[Expo Notifications] Foreground notification scheduled successfully."
        );
      } catch (error) {
        console.error(
          "[Expo Notifications] Error scheduling foreground notification:",
          error
        );
      }
    }
  );
};

export const setupBackgroundNotificationHandler = () => {
  const messagingInstance = getMessaging();
  setBackgroundMessageHandler(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log("Background/Quit FCM message received:", remoteMessage);
    }
  );
};

export const setupNotificationResponseListener = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      console.log(
        "Notification response received (tap logged only):",
        response.notification.request.content.data
      );
    }
  );

  return () => {
    subscription.remove();
  };
};

export const initializeNotifications = async (): Promise<(() => void)> => {
  await ensureNotificationChannel();

  const token = await getFcmToken();

  if (token) {
    console.log("FCM Infrastructure Initialized. Device Token:", token);
    await registerDeviceTokenWithBackend(token);
  }

  const unsubscribeForeground = setupForegroundNotificationHandler();
  const unsubscribeResponse = setupNotificationResponseListener();

  return () => {
    unsubscribeForeground();
    unsubscribeResponse();
  };
};
