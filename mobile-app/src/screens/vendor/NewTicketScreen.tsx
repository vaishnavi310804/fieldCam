import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { TicketCategorySelector } from "@/src/components/support/TicketCategorySelector";
import { TicketPrioritySelector } from "@/src/components/support/TicketPrioritySelector";
import { RelatedProjectSelector } from "@/src/components/support/RelatedProjectSelector";
import { TicketAttachmentPicker } from "@/src/components/support/TicketAttachmentPicker";
import { createSupportTicket } from "@/src/api/support.api";

 const NewTicketScreen = () => {
  const [category, setCategory] = useState<string>("General");
  const [priority, setPriority] = useState<string>("Medium");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert("Required Field", "Please enter a ticket subject.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createSupportTicket({
        subject: subject.trim(),
        category,
        priority,
        description: description.trim() || undefined,
        projectId: selectedProjectId || undefined,
      });

      Alert.alert("Success", "Support ticket created successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.error("Failed to create support ticket:", err);
      Alert.alert(
        "Creation Failed",
        err?.message || "Failed to create support ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Existing FieldCam Page Header */}
      <PageHeader
        title="New Ticket"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category Section */}
          <Text style={styles.label}>Category</Text>
          <TicketCategorySelector
            selectedCategory={category}
            onSelectCategory={setCategory}
            disabled={isSubmitting}
          />

          {/* Priority Section */}
          <Text style={styles.label}>Priority</Text>
          <TicketPrioritySelector
            selectedPriority={priority}
            onSelectPriority={setPriority}
            disabled={isSubmitting}
          />

          {/* Subject Section */}
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.textInput}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief description of the issue"
            placeholderTextColor="#A39A94"
            editable={!isSubmitting}
            autoCapitalize="sentences"
          />

          {/* Description Section */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your issue in detail..."
            placeholderTextColor="#A39A94"
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            editable={!isSubmitting}
          />

          {/* Related Work Order / Project Section (Optional) */}
          <Text style={styles.label}>Related Work Order (Optional)</Text>
          <RelatedProjectSelector
            selectedProjectId={selectedProjectId}
            onSelectProject={(projId) => setSelectedProjectId(projId)}
            disabled={isSubmitting}
          />

          {/* Attachments Section */}
          <Text style={styles.label}>Attachments</Text>
          <TicketAttachmentPicker disabled={isSubmitting} />

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Submit Ticket"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.submitRow}>
                  <Ionicons
                    name="paper-plane-outline"
                    size={18}
                    color="#FFFFFF"
                    style={styles.submitIcon}
                  />
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default NewTicketScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5C524A",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#2C2724",
  },
  multilineInput: {
    minHeight: 120,
  },
  submitContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#928880",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
