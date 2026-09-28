import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import Colors from "@/src/constants/color";
import VendorDashboardScreen from "@/src/screens/vendor/VendorDashboardScreen";

export default function AppEntryScreen() {
  const { user, logout } = useAuth();

  if (user?.role === "VENDOR") {
    return <VendorDashboardScreen />;
  }

  // Staff / Fallback Authenticated View
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>{user?.role || "STAFF"}</Text>
        <Text style={styles.title}>Staff Portal</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.name || "Field Officer"}
        </Text>
        {user?.phone ? (
          <Text style={styles.detailText}>Phone: {user.phone}</Text>
        ) : null}
        {user?.email ? (
          <Text style={styles.detailText}>Email: {user.email}</Text>
        ) : null}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    backgroundColor: Colors.peach,
    color: Colors.black,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
