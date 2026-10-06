import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VendorProjectNote } from "@/src/api/dashboard.api";

export interface ReportNotesSectionProps {
  notes?: VendorProjectNote[];
}

const formatNoteTime = (dateStr?: string): string => {
  if (!dateStr) return "Time N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Time N/A";
  const dateFormatted = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeFormatted = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateFormatted}, ${timeFormatted}`;
};

export const ReportNotesSection = ({ notes }: ReportNotesSectionProps) => {
  const notesList = Array.isArray(notes) ? notes : [];

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerRow}>
        <Ionicons name="document-text-outline" size={18} color="#374151" />
        <Text style={styles.sectionTitle}>Notes & Observations</Text>
      </View>

      {notesList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="create-outline" size={32} color="#A1A1AA" />
          <Text style={styles.emptyTitle}>No Notes Available</Text>
          <Text style={styles.emptySubtitle}>
            Project notes and field observations will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.notesList}>
          {notesList.map((note, idx) => {
            const timeStr = formatNoteTime(note.createdAt);
            const authorText = note.authorName || "Vendor Note";

            return (
              <View key={note._id || `note-${idx}`} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.authorTitle}>{authorText}</Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.timeText}>{timeStr}</Text>
                  </View>
                </View>

                <Text style={styles.noteBodyText}>{note.text}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ReportNotesSection;

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  authorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  noteBodyText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
});
