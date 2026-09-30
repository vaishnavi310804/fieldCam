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

/**
 * Request notification permission from the user (Android 13+ and iOS).
 */
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

/**
 * Obtain current FCM Device Token.
 */
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

/**
 * Listen for FCM token refresh events.
 */
export const onTokenRefresh = (callback: (token: string) => void) => {
  const messagingInstance = getMessaging();
  return onFcmTokenRefresh(messagingInstance, (token: string) => {
    console.log("FCM Token refreshed:", token);
    callback(token);
  });
};

/**
 * Register or update device token on FieldCam Platform Service backend.
 * Non-blocking: Errors are caught gracefully so app/auth flow is never interrupted.
 */
export const registerDeviceTokenWithBackend = async (
  token: string
): Promise<void> => {
  try {
    const platform = Platform.OS === "ios" ? "ios" : "android";
    await platformClient.post("/notifications/device-token", {
      deviceToken: token,
      platform,
    });
    console.log("Device token synchronized with backend successfully.");
  } catch (error) {
    console.warn("Failed to synchronize device token with backend:", error);
  }
};

/**
 * Unregister device token on FieldCam Platform Service backend during logout.
 */
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

/**
 * Set up foreground notification presentation using expo-notifications and FCM messaging.
 */
export const setupForegroundNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const messagingInstance = getMessaging();
  const unsubscribe = onMessage(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log("Foreground FCM message received:", remoteMessage);

      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || "FieldCam Notification",
            body: remoteMessage.notification.body || "",
            data: remoteMessage.data || {},
          },
          trigger: null,
        });
      }
    }
  );

  return unsubscribe;
};

/**
 * Set up background / quit state notification handler.
 */
export const setupBackgroundNotificationHandler = () => {
  const messagingInstance = getMessaging();
  setBackgroundMessageHandler(
    messagingInstance,
    async (remoteMessage: RemoteMessage) => {
      console.log("Background/Quit FCM message received:", remoteMessage);
    }
  );
};

/**
 * Set up notification response / tap listener (logs payload only for Phase 3A).
 */
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

/**
 * Initialize FCM Notification Infrastructure and synchronize token with backend.
 */
export const initializeNotifications = async (): Promise<string | null> => {
  const token = await getFcmToken();
  if (token) {
    console.log("FCM Infrastructure Initialized. Device Token:", token);
    await registerDeviceTokenWithBackend(token);
  }
  setupForegroundNotificationHandler();
  setupNotificationResponseListener();

  return token;
};
