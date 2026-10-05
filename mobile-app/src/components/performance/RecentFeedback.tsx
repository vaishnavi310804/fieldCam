import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";

export interface FeedbackItem {
  id: string;
  clientName: string;
  dateText?: string;
  rating: number;
  comment: string;
}

export interface RecentFeedbackProps {
  feedbackList?: FeedbackItem[];
}

export const RecentFeedback: React.FC<RecentFeedbackProps> = ({
  feedbackList = [],
}) => {
  const hasFeedback = Array.isArray(feedbackList) && feedbackList.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Feedback</Text>

      {!hasFeedback ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubbles-outline" size={28} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No recent feedback available</Text>
          <Text style={styles.emptySubtitle}>
            Client feedback and ratings for completed projects will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.feedbackList}>
          {feedbackList.map((item) => (
            <View key={item.id} style={styles.feedbackCard}>
              <View style={styles.headerRow}>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  {item.dateText ? (
                    <Text style={styles.dateText}>{item.dateText}</Text>
                  ) : null}
                </View>

                {/* STAR RATING ROW */}
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.commentText}>{`"${item.comment}"`}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecentFeedback;

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  commentText: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
    lineHeight: 18,
  },
});
