import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface SupportSectionHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export const SupportSectionHeader = ({
  title,
  rightElement,
}: SupportSectionHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightElement ? <View>{rightElement}</View> : null}
    </View>
  );
};

export default SupportSectionHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C2724",
    letterSpacing: -0.2,
  },
});
