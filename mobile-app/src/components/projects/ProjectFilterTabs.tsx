import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";

export interface ProjectFilterTabsProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  tabs?: string[];
}

const DEFAULT_TABS = ["All", "New", "In Progress", "Submitted", "Completed"];

export const ProjectFilterTabs = ({
  selectedTab,
  onSelectTab,
  tabs = DEFAULT_TABS,
}: ProjectFilterTabsProps) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => {
          const isSelected = selectedTab.toLowerCase() === tab.toLowerCase();

          return (
            <Pressable
              key={tab}
              style={[
                styles.tabPill,
                isSelected ? styles.tabPillSelected : styles.tabPillUnselected,
              ]}
              onPress={() => onSelectTab(tab)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected ? styles.tabTextSelected : styles.tabTextUnselected,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ProjectFilterTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabPillSelected: {
    backgroundColor: "#1D61E7",
  },
  tabPillUnselected: {
    backgroundColor: "#EAE4DF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextSelected: {
    color: "#FFFFFF",
  },
  tabTextUnselected: {
    color: "#6E6763",
  },
});
