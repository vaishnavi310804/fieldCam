import { Pressable, StyleSheet, Text, View } from "react-native";
import { SupportTicketItem } from "@/src/api/support.api";

export interface TicketCardProps {
  ticket: SupportTicketItem;
  onPress?: () => void;
}

const getStatusBadgeStyle = (status: string) => {
  const normalized = (status || "").trim().toLowerCase();

  switch (normalized) {
    case "open":
      return {
        bg: "#DBEAFE",
        text: "#1E40AF",
        label: "Open",
      };
    case "in progress":
    case "inprogress":
      return {
        bg: "#FEF9C3",
        text: "#854D0E",
        label: "In Progress",
      };
    case "resolved":
    case "closed":
      return {
        bg: "#DCFCE7",
        text: "#166534",
        label: normalized === "resolved" ? "Resolved" : "Closed",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#374151",
        label: status || "Open",
      };
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const TicketCard = ({ ticket, onPress }: TicketCardProps) => {
  const badge = getStatusBadgeStyle(ticket.status);
  const formattedDate = formatDate(ticket.createdAt || ticket.lastUpdate);

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${ticket.ticketId}, ${ticket.subject}`}
    >
      {/* Top Row: Ticket ID & Status Badge */}
      <View style={styles.topRow}>
        <Text style={styles.ticketIdText}>{ticket.ticketId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Subject Title */}
      <Text style={styles.subjectText} numberOfLines={2}>
        {ticket.subject}
      </Text>

      {/* Footer Row: Date & Category */}
      <View style={styles.footerRow}>
        {formattedDate ? (
          <Text style={styles.dateText}>{formattedDate}</Text>
        ) : null}
        {ticket.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{ticket.category}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

export default TicketCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAE4DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ticketIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9C958E",
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2724",
    lineHeight: 20,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#817B77",
    fontWeight: "500",
  },
  categoryPill: {
    backgroundColor: "#F3EFEA",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E6762",
  },
});
