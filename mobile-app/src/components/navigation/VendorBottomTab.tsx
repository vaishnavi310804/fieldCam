import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/src/constants/color";

export const VendorBottomTab = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors?.[focusedRoute.key]?.options;

  if ((focusedOptions?.tabBarStyle as any)?.display === "none") {
    return null;
  }

  const tabs = [
    { name: "index", label: "Home", icon: "home", iconOutline: "home-outline" },
    { name: "projects", label: "Projects", icon: "folder", iconOutline: "folder-outline" },
    { name: "capture", label: "Capture", icon: "camera", iconOutline: "camera" },
    { name: "earnings", label: "Earnings", icon: "cash", iconOutline: "cash-outline" },
    { name: "support", label: "Support", icon: "headset", iconOutline: "headset-outline" },
  ];

  return (
    <View style={[styles.bottomNavWrapper, { bottom: bottomMargin }]}>
      <View style={styles.bottomNavContainer}>
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === routeIndex;
          const routeKey = routeIndex >= 0 ? state.routes[routeIndex].key : "";

          const onPress = () => {
            if (routeIndex >= 0) {
              const event = navigation.emit({
                type: "tabPress",
                target: routeKey,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            } else {
              navigation.navigate(tab.name);
            }
          };

          // Center Raised Capture Action Button
          if (tab.name === "capture") {
            return (
              <Pressable
                key={tab.name}
                style={styles.centerCameraButton}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel="Capture"
              >
                <Ionicons name="camera" size={22} color={Colors.white} />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.name}
              style={styles.navTab}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
            >
              <View
                style={[
                  styles.activeTabBg,
                  isFocused && styles.activeTabBgSelected,
                ]}
              >
                <Ionicons
                  name={
                    (isFocused ? tab.icon : tab.iconOutline) as keyof typeof Ionicons.glyphMap
                  }
                  size={20}
                  color={isFocused ? Colors.primary : Colors.gray}
                />
              </View>
              <Text
                style={[
                  styles.navLabel,
                  isFocused && styles.activeNavLabel,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default VendorBottomTab;

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 100,
  },
  bottomNavContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  navTab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeTabBg: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  activeTabBgSelected: {
    backgroundColor: Colors.peach,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: "500",
    marginTop: 2,
  },
  activeNavLabel: {
    color: Colors.primary,
    fontWeight: "700",
  },
  centerCameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8C827A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
