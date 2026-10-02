import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export const PageHeader = ({
  title,
  showBackButton = true,
  onBackPress,
  rightElement,
}: PageHeaderProps) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 20) + 30;
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)");
    }
  };

  return (
    <LinearGradient
      colors={["#D8CCC2", "#C2B2A5", "#A8988B"]}
      start={{ x: 0.8, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.headerContainer, { paddingTop: topPadding }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <Pressable
              style={styles.actionSquare}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          {rightElement || null}
        </View>
      </View>
    </LinearGradient>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    width: 44,
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContainer: {
    width: 44,
    alignItems: "flex-end",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F0F0F",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  actionSquare: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
