import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { router } from "expo-router";
import { setAuthToken } from "../api/authClient";

let isHandlingSessionRevocation = false;

export const handleSessionRevocation = async () => {
  if (isHandlingSessionRevocation) {
    return;
  }
  isHandlingSessionRevocation = true;

  try {
    // 1. Remove stored tokens and user state from AsyncStorage
    await AsyncStorage.multiRemove(["accessToken", "authUser"]);

    // 2. Clear default Authorization headers from both Axios clients
    setAuthToken(null);

    // 3. Display single notification alert to user
    Alert.alert(
      "Session Expired",
      "Your session was logged out. Please sign in again.",
      [
        {
          text: "OK",
          onPress: () => {
            try {
              router.replace("/(auth)/login");
            } catch (err) {
              console.error("Navigation replace error on session revocation:", err);
            } finally {
              setTimeout(() => {
                isHandlingSessionRevocation = false;
              }, 1000);
            }
          },
        },
      ],
      { cancelable: false }
    );

    // Safety fallback navigation in case alert is dismissed automatically
    setTimeout(() => {
      try {
        router.replace("/(auth)/login");
      } catch {
        // ignore
      } finally {
        setTimeout(() => {
          isHandlingSessionRevocation = false;
        }, 1000);
      }
    }, 1500);
  } catch (error) {
    console.error("Error during session revocation handling:", error);
    isHandlingSessionRevocation = false;
  }
};
