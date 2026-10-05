import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/color";
import { VendorStaffItem } from "@/src/api/dashboard.api";

export interface StaffProfileCardProps {
  staff: VendorStaffItem;
}

export const StaffProfileCard: React.FC<StaffProfileCardProps> = ({ staff }) => {
  const name = staff.name || "Staff Member";
  const initials = name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SM";

  const rawRole = staff.role || "STAFF";
  const roleDisplay =
    rawRole.toUpperCase() === "STAFF" || rawRole.toUpperCase() === "VENDOR"
      ? "Field Worker"
      : rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const rawStatus = (staff.status || "ACTIVE").toLowerCase();
  const isActive = rawStatus === "active";

  const formattedCreatedDate = staff.createdAt
    ? new Date(staff.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <View style={styles.cardContainer}>
      {/* HEADER ROW WITH AVATAR & STATUS */}
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          {staff.profileImage ? (
            <Image source={{ uri: staff.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View
            style={[
              styles.statusIndicatorDot,
              { backgroundColor: isActive ? "#22C55E" : "#9CA3AF" },
            ]}
          />
        </View>

        <View style={styles.nameHeaderDetails}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.roleStatusRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleDisplay}</Text>
            </View>

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
          </View>
        </View>
      </View>

      {/* DETAILS LIST */}
      <View style={styles.detailsList}>
        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Email Address</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {staff.email || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone Number</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {staff.phone || "N/A"}
            </Text>
          </View>
        </View>

        {formattedCreatedDate ? (
          <>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Added On</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {formattedCreatedDate}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};

export default StaffProfileCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D6C6BB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  statusIndicatorDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameHeaderDetails: {
    flex: 1,
    marginLeft: 16,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 6,
  },
  roleStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "#F3EFEA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B5E54",
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
    fontSize: 12,
    fontWeight: "700",
  },
  activeStatusText: {
    color: "#16A34A",
  },
  inactiveStatusText: {
    color: "#6B7280",
  },
  detailsList: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
});
