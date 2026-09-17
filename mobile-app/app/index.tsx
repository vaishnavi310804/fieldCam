import { router } from "expo-router";

import SplashScreen from "../src/screens/welcome/SplashScreen";

export default function Index() {
  const handleContinue = () => {
    router.replace("/(auth)/login");
  };

  return <SplashScreen onContinue={handleContinue} />;
}