import React, { useState, useEffect, useCallback } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { invoicesApi, InvoiceListItem } from "@/src/api/invoices.api";
import { InvoicePreviewDetails } from "@/src/components/invoices/InvoicePreviewDetails";
import { useAuth } from "@/src/context/AuthContext";
import { previewDraftStore } from "@/src/utils/previewDraftStore";

export const InvoicePreviewScreen: React.FC = () => {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string; invoiceId?: string; mode?: string }>();
  const isUnsavedMode = params.mode === "unsaved";
  const invoiceIdParam = params.id || params.invoiceId || "";

  const [invoice, setInvoice] = useState<InvoiceListItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetails = useCallback(
    async (showLoading = true) => {
      if (!invoiceIdParam) {
        setError("Invoice ID is missing from navigation parameters.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError(null);
        const fetchedInvoice = await invoicesApi.getInvoiceById(invoiceIdParam);
        setInvoice(fetchedInvoice);
      } catch (err: any) {
        console.warn("Failed to fetch invoice details:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load invoice preview."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [invoiceIdParam]
  );

  useEffect(() => {
    if (isUnsavedMode) {
      const draft = previewDraftStore.getDraft();
      if (!draft) {
        setError("No draft invoice found to preview.");
        setIsLoading(false);
        return;
      }
      const mockInvoice = previewDraftStore.toInvoiceListItem(draft, user);
      setInvoice(mockInvoice);
      setIsLoading(false);
      setError(null);
      return;
    }

    fetchInvoiceDetails(true);
  }, [isUnsavedMode, fetchInvoiceDetails, user]);

  const onRefresh = useCallback(() => {
    if (isUnsavedMode) {
      const draft = previewDraftStore.getDraft();
      if (draft) {
        setInvoice(previewDraftStore.toInvoiceListItem(draft, user));
      }
      return;
    }
    setIsRefreshing(true);
    fetchInvoiceDetails(false);
  }, [isUnsavedMode, fetchInvoiceDetails, user]);

  // PDF Download & Share
  const handleDownloadPdf = async () => {
    if (isUnsavedMode) {
      Alert.alert(
        "PDF Unavailable",
        "Invoice PDF will be available for download after submitting the invoice."
      );
      return;
    }

    if (!invoice || !invoice._id || invoice._id === "draft-unsaved-preview") return;

    try {
      setIsDownloadingPdf(true);
      const arrayBuffer = await invoicesApi.downloadInvoicePdf(invoice._id);

      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 =
        typeof btoa !== "undefined"
          ? btoa(binary)
          : (global as any).btoa(binary);

      const filename = `FieldCam_Invoice_${invoice.invoiceId || invoice._id}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert("PDF Saved", `Invoice PDF saved to:\n${fileUri}`);
      }
    } catch (err: any) {
      console.error("Failed to download invoice PDF:", err);
      Alert.alert(
        "Download Failed",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate invoice PDF document."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Submit Unsaved Draft, Persisted Draft, or Resubmit Rejected invoice
  const handleSubmitInvoice = async () => {
    if (isUnsavedMode) {
      const draft = previewDraftStore.getDraft();
      if (!draft) {
        Alert.alert("Submission Error", "No draft invoice found to submit.");
        return;
      }

      try {
        setIsSubmitting(true);
        let result: InvoiceListItem;
        if (draft.existingInvoiceId) {
          result = await invoicesApi.updateInvoice(draft.existingInvoiceId, {
            items: draft.lineItems,
            invoiceDate: draft.invoiceDate || undefined,
            dueDate: draft.dueDate || undefined,
            notes: draft.notes?.trim() || undefined,
            submit: true,
          });
        } else {
          result = await invoicesApi.createInvoice({
            projectId: draft.projectId,
            invoiceId: draft.invoiceNumber.trim() || undefined,
            items: draft.lineItems,
            invoiceDate: draft.invoiceDate || undefined,
            dueDate: draft.dueDate || undefined,
            notes: draft.notes?.trim() || undefined,
            status: "Submitted",
          });
        }

        // Clear in-memory draft on successful submission
        previewDraftStore.clearDraft();
        setInvoice(result);
        router.setParams({ id: result._id, mode: "" });
        Alert.alert(
          "Invoice Submitted",
          "Your invoice has been submitted for administrator review."
        );
      } catch (err: any) {
        console.error("Failed to submit unsaved invoice:", err);
        Alert.alert(
          "Submission Error",
          err?.response?.data?.message ||
            err?.message ||
            "Failed to submit invoice for review."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!invoice) return;

    try {
      setIsSubmitting(true);
      const updated = await invoicesApi.submitInvoice(invoice._id);
      setInvoice(updated);
      Alert.alert(
        "Invoice Submitted",
        "Your invoice has been submitted for administrator review."
      );
    } catch (err: any) {
      console.error("Failed to submit invoice:", err);
      Alert.alert(
        "Submission Error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit invoice for review."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit permitted in unsaved preview or when in Draft / Rejected status
  const canEdit = isUnsavedMode || invoice?.status === "Draft" || invoice?.status === "Rejected";
  const canSubmit = isUnsavedMode || invoice?.status === "Draft" || invoice?.status === "Rejected";

  const handleEditPress = () => {
    if (isUnsavedMode) {
      // In unsaved preview, go back to RaiseInvoiceScreen where in-memory state is preserved
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(app)/raise-invoice");
      }
      return;
    }

    if (!invoice) return;
    const projId =
      invoice.projectId?._id ||
      (typeof invoice.projectId === "string" ? invoice.projectId : "");
    router.push({
      pathname: "/(app)/raise-invoice",
      params: { projectId: projId, invoiceId: invoice._id },
    });
  };

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Invoice Preview"
        showBackButton
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(isUnsavedMode ? "/(app)/raise-invoice" : "/(app)/earnings");
          }
        }}
        rightElement={
          invoice && !isUnsavedMode ? (
            <Pressable
              style={styles.headerDownloadButton}
              onPress={handleDownloadPdf}
              disabled={isDownloadingPdf}
              accessibilityRole="button"
              accessibilityLabel="Download PDF"
            >
              {isDownloadingPdf ? (
                <ActivityIndicator size="small" color="#1F1D1B" />
              ) : (
                <Ionicons name="download-outline" size={20} color="#1F1D1B" />
              )}
            </Pressable>
          ) : null
        }
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#928880" />
          <Text style={styles.loadingText}>Loading invoice preview...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={42} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to load preview</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => fetchInvoiceDetails(true)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : invoice ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#928880"]}
              tintColor="#928880"
            />
          }
        >
          {/* Main Invoice Preview Document & Status Cards */}
          <InvoicePreviewDetails invoice={invoice} />

          {/* Download PDF Action Button (persisted invoices only) */}
          {!isUnsavedMode && (
            <Pressable
              style={[
                styles.pdfDownloadButton,
                isDownloadingPdf && styles.buttonDisabled,
              ]}
              onPress={handleDownloadPdf}
              disabled={isDownloadingPdf}
            >
              {isDownloadingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.pdfDownloadButtonText}>
                    Download Invoice (PDF)
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Secondary Actions Row */}
          <View style={styles.secondaryActionsRow}>
            {canEdit && (
              <Pressable
                style={styles.editButton}
                onPress={handleEditPress}
              >
                <Ionicons name="create-outline" size={17} color="#1F1D1B" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}

            {canSubmit ? (
              <Pressable
                style={[
                  styles.submitReviewButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmitInvoice}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="paper-plane-outline"
                      size={17}
                      color="#FFFFFF"
                    />
                    <Text style={styles.submitReviewButtonText}>
                      {invoice.status === "Rejected" ? "Resubmit Invoice" : "Submit for Review"}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <View style={styles.submittedInfoBox}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color="#6E655F"
                />
                <Text style={styles.submittedInfoText}>
                  {invoice.status === "Paid"
                    ? "Payment has been recorded for this invoice."
                    : invoice.status === "Approved"
                    ? "Invoice approved. Awaiting client payment."
                    : "Invoice submitted and awaiting administrator review."}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
};

export default InvoicePreviewScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FAF8F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerDownloadButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8C827A",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1D1B",
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 13,
    color: "#8C827A",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#928880",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  pdfDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8C827A",
    borderRadius: 18,
    paddingVertical: 15,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 12,
  },
  pdfDownloadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#D6CCC5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  submitReviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B894",
    borderRadius: 18,
    paddingVertical: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  submitReviewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  submittedInfoBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F2EF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  submittedInfoText: {
    flex: 1,
    fontSize: 11,
    color: "#6E655F",
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
