import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SupportSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SupportSearchBar = ({
  value,
  onChangeText,
  placeholder = "Search help articles or tickets...",
}: SupportSearchBarProps) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={18} color="#9C958E" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A39A94"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
};

export default SupportSearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EFEA",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2B2623",
    fontWeight: "400",
  },
});
