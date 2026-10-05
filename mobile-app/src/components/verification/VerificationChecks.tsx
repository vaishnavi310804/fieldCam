import React from "react";
import { StyleSheet, View } from "react-native";
import { VerificationCheckRow, VerificationCheckRowProps } from "./VerificationCheckRow";
import { VendorProjectPhoto, VendorProjectItem } from "@/src/api/dashboard.api";

export interface VerificationChecksProps {
  photo?: VendorProjectPhoto;
  project?: VendorProjectItem;
}

export const VerificationChecks: React.FC<VerificationChecksProps> = ({
  photo,
  project,
}) => {
  const aiVal = photo?.aiValidation;

  // 1. Image Clarity Check
  const getClarityCheck = (): VerificationCheckRowProps => {
    if (!aiVal) {
      return {
        title: "Image Clarity",
        detail: "Evaluation pending",
        status: "pending",
      };
    }
    if (aiVal.clarity) {
      const isPassed = Boolean(aiVal.clarity.passed);
      return {
        title: "Image Clarity",
        detail: isPassed ? "Sharp, well-focused image" : "Low image clarity / blurry photo",
        status: isPassed ? "passed" : "failed",
      };
    }
    return {
      title: "Image Clarity",
      detail: aiVal.status === "PASSED" ? "Sharp, well-focused image" : "Evaluation pending",
      status: aiVal.status === "PASSED" ? "passed" : "pending",
    };
  };

  // 2. Lighting Quality Check
  const getLightingCheck = (): VerificationCheckRowProps => {
    if (!aiVal) {
      return {
        title: "Lighting Quality",
        detail: "Evaluation pending",
        status: "pending",
      };
    }
    if (aiVal.lighting) {
      const isPassed = Boolean(aiVal.lighting.passed);
      return {
        title: "Lighting Quality",
        detail: isPassed ? "Good exposure & lighting" : "Poor lighting or exposure issue",
        status: isPassed ? "passed" : "failed",
      };
    }
    return {
      title: "Lighting Quality",
      detail: aiVal.status === "PASSED" ? "Good exposure" : "Evaluation pending",
      status: aiVal.status === "PASSED" ? "passed" : "pending",
    };
  };

  // 3. Subject Coverage Check
  const getSubjectCheck = (): VerificationCheckRowProps => {
    if (!aiVal) {
      return {
        title: "Subject Coverage",
        detail: "Evaluation pending",
        status: "pending",
      };
    }
    if (aiVal.subject) {
      const isPassed = Boolean(aiVal.subject.passed);
      let detailText = isPassed
        ? "Matches required inspection subject"
        : aiVal.subject.reason || "Subject does not match expected category";
      if (isPassed && aiVal.subject.detectedDescription) {
        detailText = `Matches subject (${aiVal.subject.detectedDescription})`;
      }
      return {
        title: "Subject Coverage",
        detail: detailText,
        status: isPassed ? "passed" : "failed",
      };
    }
    return {
      title: "Subject Coverage",
      detail: aiVal.status === "PASSED" ? "Subject matches work order" : aiVal.reason || "Evaluation pending",
      status: aiVal.status === "PASSED" ? "passed" : aiVal.status === "FAILED" ? "failed" : "pending",
    };
  };

  // 4. GPS Verification Check (Platform Data)
  const getGpsCheck = (): VerificationCheckRowProps => {
    const loc = photo?.location;
    if (loc && typeof loc.latitude === "number" && typeof loc.longitude === "number") {
      return {
        title: "GPS Verification",
        detail: `Geotagged (${loc.latitude.toFixed(4)}°, ${loc.longitude.toFixed(4)}°)`,
        status: "passed",
      };
    }
    return {
      title: "GPS Verification",
      detail: "GPS coordinates missing or unverified",
      status: "failed",
    };
  };

  // 5. Timestamp Validation Check (Platform Data)
  const getTimestampCheck = (): VerificationCheckRowProps => {
    const ts = photo?.capturedAt || photo?.uploadedAt;
    if (ts) {
      try {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          const formatted = d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return {
            title: "Timestamp Valid",
            detail: `Captured on ${formatted}`,
            status: "passed",
          };
        }
      } catch {
        // Fall through
      }
      return {
        title: "Timestamp Valid",
        detail: `Captured: ${ts}`,
        status: "passed",
      };
    }
    return {
      title: "Timestamp Valid",
      detail: "Capture timestamp missing",
      status: "failed",
    };
  };

  const checks: VerificationCheckRowProps[] = [
    getClarityCheck(),
    getLightingCheck(),
    getSubjectCheck(),
    getGpsCheck(),
    getTimestampCheck(),
  ];

  return (
    <View style={styles.container}>
      {checks.map((item, idx) => (
        <VerificationCheckRow
          key={`${item.title}-${idx}`}
          title={item.title}
          detail={item.detail}
          status={item.status}
        />
      ))}
    </View>
  );
};

export default VerificationChecks;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 24,
  },
});
