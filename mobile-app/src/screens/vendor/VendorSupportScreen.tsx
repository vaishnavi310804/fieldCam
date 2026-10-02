import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { SupportSearchBar } from "@/src/components/support/SupportSearchBar";
import { SupportActionCard } from "@/src/components/support/SupportActionCard";
import { SupportSectionHeader } from "@/src/components/support/SupportSectionHeader";
import { TicketCard } from "@/src/components/support/TicketCard";
import {
  getVendorSupportTickets,
  SupportTicketItem,
} from "@/src/api/support.api";

export const VendorSupportScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from real backend API
  const fetchTicketsData = useCallback(async (showLoading = true, search = "") => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const realTickets = await getVendorSupportTickets({ search });
      setTickets(realTickets || []);
    } catch (err: any) {
      console.error("Failed to load support tickets:", err);
      setError(err?.message || "Failed to load support tickets.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTicketsData(true, searchQuery);
    }, [fetchTicketsData, searchQuery])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTicketsData(false, searchQuery);
  }, [fetchTicketsData, searchQuery]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    fetchTicketsData(false, text);
  };

  // Action card handlers (truthful feedback for features without dedicated backend endpoints)
  const handleLiveChat = () => {
    Alert.alert(
      "Live Chat",
      "Live Support Chat is currently offline. Please click '+ New Ticket' to submit a support request."
    );
  };

  const handleCallSupport = () => {
    Alert.alert(
      "Call Support",
      "FieldCam Support Desk is available Monday - Friday, 9:00 AM - 6:00 PM."
    );
  };

  const handleKnowledgeBase = () => {
    Alert.alert("Knowledge Base", "Help articles and Knowledge Base content are coming soon.");
  };

  const handleVideoGuides = () => {
    Alert.alert("Video Guides", "Video tutorials and walkthrough guides are coming soon.");
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Existing FieldCam Page Header */}
        <PageHeader
          title="Support"
          showBackButton={true}
          onBackPress={() => router.back()}
        />

        {/* Search Bar */}
        <SupportSearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search help articles or tickets..."
        />

        {/* 2x2 Support Action Cards Grid */}
        <View style={styles.actionGridContainer}>
          <View style={styles.gridRow}>
            <SupportActionCard
              title="Live Chat"
              iconName="chatbubble-ellipses-outline"
              iconColor="#3B82F6"
              iconBgColor="#EFF6FF"
              onPress={handleLiveChat}
            />
            <View style={styles.gridSpacer} />
            <SupportActionCard
              title="Call Support"
              iconName="call-outline"
              iconColor="#16A34A"
              iconBgColor="#F0FDF4"
              onPress={handleCallSupport}
            />
          </View>

          <View style={styles.gridRow}>
            <SupportActionCard
              title="Knowledge Base"
              iconName="document-text-outline"
              iconColor="#8B5CF6"
              iconBgColor="#FAF5FF"
              onPress={handleKnowledgeBase}
            />
            <View style={styles.gridSpacer} />
            <SupportActionCard
              title="Video Guides"
              iconName="help-circle-outline"
              iconColor="#CA8A04"
              iconBgColor="#FEFCE8"
              onPress={handleVideoGuides}
            />
          </View>
        </View>

        {/* FREQUENTLY ASKED SECTION */}
        <SupportSectionHeader title="Frequently Asked" />
        <View style={styles.emptyFaqContainer}>
          <Ionicons name="journal-outline" size={24} color="#A39A94" />
          <Text style={styles.emptyFaqText}>No help articles available.</Text>
        </View>

        {/* MY TICKETS SECTION */}
        <SupportSectionHeader
          title="My Tickets"
          rightElement={
            <Pressable
              style={styles.newTicketButton}
              onPress={() => router.push("/(app)/new-ticket" as any)}
              accessibilityRole="button"
              accessibilityLabel="New Ticket"
            >
              <Ionicons name="add" size={16} color="#2563EB" style={styles.addIcon} />
              <Text style={styles.newTicketText}>New Ticket</Text>
            </Pressable>
          }
        />

        {/* Tickets Loading / Error / Content */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching support tickets...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => fetchTicketsData(true, searchQuery)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyTicketsContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="ticket-outline" size={30} color="#8C827A" />
            </View>
            <Text style={styles.emptyTicketsTitle}>
              {searchQuery.trim() ? "No matching tickets" : "No support tickets yet"}
            </Text>
            <Text style={styles.emptyTicketsSubtitle}>
              {searchQuery.trim()
                ? "Try adjusting your search query."
                : "Have a question or issue? Tap '+ New Ticket' above to get help."}
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id || ticket.ticketId}
              ticket={ticket}
              onPress={() => {
                Alert.alert(
                  `Ticket ${ticket.ticketId}`,
                  `Subject: ${ticket.subject}\nStatus: ${ticket.status}\nCategory: ${ticket.category || "General"}\n\n${ticket.description || "No additional description provided."}`
                );
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default VendorSupportScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  titleHeaderArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitleText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1917",
    letterSpacing: -0.5,
  },
  actionGridContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridSpacer: {
    width: 12,
  },
  emptyFaqContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
    flexDirection: "row",
    gap: 8,
  },
  emptyFaqText: {
    fontSize: 13,
    color: "#817B77",
    fontWeight: "500",
  },
  newTicketButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addIcon: {
    marginRight: 2,
  },
  newTicketText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#817B77",
  },
  errorContainer: {
    padding: 24,
    marginHorizontal: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 13,
    color: "#991B1B",
    textAlign: "center",
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyTicketsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F3EFEA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTicketsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C2724",
    marginBottom: 4,
  },
  emptyTicketsSubtitle: {
    fontSize: 12,
    color: "#817B77",
    textAlign: "center",
  },
});
