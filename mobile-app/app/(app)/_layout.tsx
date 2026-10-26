import { Tabs } from "expo-router";
import { VendorBottomTab } from "@/src/components/navigation/VendorBottomTab";
import { useAuth } from "@/src/context/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();
  const isVendor = user?.role === "VENDOR";

  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => (isVendor ? <VendorBottomTab {...props} /> : null)}
      screenOptions={{
        headerShown: false,
        tabBarStyle: isVendor ? undefined : { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="projects" options={{ title: "Projects" }} />
      <Tabs.Screen name="capture" options={{ title: "Capture" }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
      <Tabs.Screen name="support" options={{ title: "Support" }} />
      <Tabs.Screen name="team" options={{ href: null }} />
      <Tabs.Screen name="add-staff" options={{ href: null }} />
      <Tabs.Screen name="staff-details" options={{ href: null }} />
      <Tabs.Screen name="edit-staff" options={{ href: null }} />
      <Tabs.Screen name="assign-project" options={{ href: null }} />
      <Tabs.Screen name="project-assigned" options={{ href: null }} />
      <Tabs.Screen name="performance-dashboard" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="project-report" options={{ href: null }} />
      <Tabs.Screen name="project-timeline" options={{ href: null }} />
      <Tabs.Screen name="project-details" options={{ href: null }} />
      <Tabs.Screen name="ai-verification" options={{ href: null }} />
      <Tabs.Screen name="new-ticket" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="raise-invoice" options={{ href: null }} />
      <Tabs.Screen name="invoice-preview" options={{ href: null }} />
      <Tabs.Screen name="live-chat" options={{ href: null }} />
    </Tabs>
  );
}
