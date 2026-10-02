import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getVendorProjects, VendorProjectItem } from "@/src/api/dashboard.api";

export interface RelatedProjectSelectorProps {
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null, projectCode?: string) => void;
  disabled?: boolean;
}

export const RelatedProjectSelector = ({
  selectedProjectId,
  onSelectProject,
  disabled = false,
}: RelatedProjectSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [projects, setProjects] = useState<VendorProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await getVendorProjects();
        if (isMounted) {
          setProjects(data || []);
          if (selectedProjectId) {
            const found = data.find((p) => p._id === selectedProjectId);
            if (found) {
              setSelectedLabel(`${found.projectId} - ${found.projectName}`);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load vendor projects for support ticket:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const handleSelect = (proj: VendorProjectItem | null) => {
    if (proj) {
      onSelectProject(proj._id, proj.projectId);
      setSelectedLabel(`${proj.projectId} - ${proj.projectName}`);
    } else {
      onSelectProject(null);
      setSelectedLabel("");
    }
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.fieldContainer}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Related Work Order or Project"
      >
        <Text
          style={[
            styles.valueText,
            !selectedLabel && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedLabel || "WO-2024-XXXX (Select Project)"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#817B77" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Related Work Order / Project</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#6E6762" />
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#928880" />
                <Text style={styles.loadingText}>Loading assigned projects...</Text>
              </View>
            ) : (
              <ScrollView style={styles.projectList} showsVerticalScrollIndicator={false}>
                {/* None / General Option */}
                <Pressable
                  style={[
                    styles.optionRow,
                    !selectedProjectId && styles.optionRowSelected,
                  ]}
                  onPress={() => handleSelect(null)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !selectedProjectId && styles.optionTextSelected,
                    ]}
                  >
                    None (General Ticket)
                  </Text>
                  {!selectedProjectId ? (
                    <Ionicons name="checkmark" size={18} color="#928880" />
                  ) : null}
                </Pressable>

                {/* Real Vendor Projects */}
                {projects.map((proj) => {
                  const isSelected = selectedProjectId === proj._id;
                  return (
                    <Pressable
                      key={proj._id}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                      onPress={() => handleSelect(proj)}
                    >
                      <View style={styles.projectInfoCol}>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {proj.projectId}
                        </Text>
                        <Text style={styles.projectSubText} numberOfLines={1}>
                          {proj.projectName} {proj.location ? `• ${proj.location}` : ""}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} color="#928880" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default RelatedProjectSelector;

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2724",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#A39A94",
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#EAE4DF",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C2724",
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#817B77",
  },
  projectList: {
    maxHeight: 300,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionRowSelected: {
    backgroundColor: "#FAF7F5",
  },
  projectInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A423F",
  },
  optionTextSelected: {
    fontWeight: "700",
    color: "#2C2724",
  },
  projectSubText: {
    fontSize: 12,
    color: "#817B77",
    marginTop: 2,
  },
});
