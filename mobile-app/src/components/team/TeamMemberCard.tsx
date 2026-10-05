import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";
import { VendorStaffItem, VendorTeamMemberItem } from "@/src/api/dashboard.api";

export interface TeamMemberCardProps {
  member: VendorStaffItem | VendorTeamMemberItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const TeamMemberCard = ({
  member,
  isExpanded,
  onToggleExpand,
}: TeamMemberCardProps) => {
  const name =
    (member as VendorStaffItem).name ||
    (member as VendorTeamMemberItem).contactName ||
    (member as VendorTeamMemberItem).userId?.name ||
    (member as VendorTeamMemberItem).companyName ||
    "Staff Member";

  const initials =
    name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SM";

  const rawRole =
    (member as VendorStaffItem).role ||
    (member as VendorTeamMemberItem).userId?.role ||
    "STAFF";

  const roleDisplay =
    rawRole.toUpperCase() === "STAFF" || rawRole.toUpperCase() === "VENDOR"
      ? "Field Worker"
      : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const rawStatus = (
    member.status ||
    (member as VendorTeamMemberItem).userId?.status ||
    "ACTIVE"
  ).toLowerCase();
  const isActive = rawStatus === "active";

  const phone =
    (member as VendorStaffItem).phone ||
    (member as VendorTeamMemberItem).userId?.phone ||
    "N/A";

  const email =
    (member as VendorStaffItem).email ||
    (member as VendorTeamMemberItem).userId?.email ||
    "N/A";

  const profileImage = (member as VendorStaffItem).profileImage;

  // Rating & active projects are only rendered if legitimately provided by backend
  const rating =
    typeof (member as VendorTeamMemberItem).rating === "number"
      ? (member as VendorTeamMemberItem).rating!.toFixed(1)
      : null;

  const activeProjectsCount =
    typeof (member as VendorTeamMemberItem).activeProjects === "number"
      ? (member as VendorTeamMemberItem).activeProjects
      : null;

  return (
    <View style={styles.cardContainer}>
      {/* CARD HEADER / MAIN ROW */}
      <Pressable
        style={styles.headerRow}
        onPress={onToggleExpand}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${roleDisplay}`}
      >
        {/* AVATAR + ONLINE INDICATOR */}
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActive ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        {/* MIDDLE INFO */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>

          <View style={styles.roleRatingRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleDisplay}</Text>
            </View>

            {rating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            ) : null}
          </View>

          {typeof activeProjectsCount === "number" ? (
            <View style={styles.projectsRow}>
              <Ionicons name="folder-outline" size={14} color="#6B7280" />
              <Text style={styles.projectsText}>
                {activeProjectsCount} Active Projects
              </Text>
            </View>
          ) : null}
        </View>

        {/* RIGHT SIDE BADGE + CHEVRON */}
        <View style={styles.rightContainer}>
          <View
            style={[
              styles.statusPill,
              isActive ? styles.activeStatusPill : styles.inactiveStatusPill,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isActive ? styles.activeStatusText : styles.inactiveStatusText,
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>

          <View style={styles.chevronContainer}>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#9CA3AF"
            />
          </View>
        </View>
      </Pressable>

      {/* EXPANDED SECTION */}
      {isExpanded ? (
        <View style={styles.expandedContent}>
          {/* CONTACT INFO CONTAINER */}
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={14} color="#6B7280" />
              <Text style={styles.contactText} numberOfLines={1}>
                {phone}
              </Text>
            </View>

            <View style={styles.contactDivider} />

            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={14} color="#6B7280" />
              <Text style={styles.contactText} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default TeamMemberCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D6C6BB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  roleRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: "#F3EFEA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B5E54",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  projectsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  projectsText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 52,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusPill: {
    backgroundColor: "#DCFCE7",
  },
  inactiveStatusPill: {
    backgroundColor: "#F3F4F6",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeStatusText: {
    color: "#16A34A",
  },
  inactiveStatusText: {
    color: "#6B7280",
  },
  chevronContainer: {
    marginTop: 10,
  },

  /* EXPANDED CONTENT */
  expandedContent: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  contactCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contactItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  contactText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
    flex: 1,
  },
});
