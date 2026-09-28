import { router } from "expo-router";
import SplashScreen from "../src/screens/welcome/SplashScreen";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  const handleContinue = () => {
    if (isAuthenticated) {
      router.replace("/(app)/" as any);
    } else {
      router.replace("/(auth)/login");
    }
  };

  return <SplashScreen onContinue={handleContinue} />;
}