import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { PageHeader } from "@/src/components/navigation/PageHeader";
import {
  invoicesApi,
  InvoicePreviewResponse,
  InvoiceLineItem,
  InvoiceListItem,
} from "@/src/api/invoices.api";
import { getVendorProjects, VendorProjectItem } from "@/src/api/dashboard.api";
import { useAuth } from "@/src/context/AuthContext";
import { ProjectApprovedBanner } from "@/src/components/invoices/ProjectApprovedBanner";
import { ProjectReferenceCard } from "@/src/components/invoices/ProjectReferenceCard";
import { InvoiceDetailsForm } from "@/src/components/invoices/InvoiceDetailsForm";
import { InvoiceLineItems } from "@/src/components/invoices/InvoiceLineItems";
import { InvoiceSummary } from "@/src/components/invoices/InvoiceSummary";
import { InvoiceUploadNotice } from "@/src/components/invoices/InvoiceUploadNotice";
import { InvoiceSignatureNotice } from "@/src/components/invoices/InvoiceSignatureNotice";
import { previewDraftStore } from "@/src/utils/previewDraftStore";

export const RaiseInvoiceScreen: React.FC = () => {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ projectId?: string; id?: string; invoiceId?: string }>();
  const initialProjectId = params.projectId || params.id || "";
  const initialInvoiceId = params.invoiceId || "";

  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [existingInvoiceId, setExistingInvoiceId] = useState<string>(initialInvoiceId);
  const [approvedProjects, setApprovedProjects] = useState<VendorProjectItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Preview state
  const [previewInfo, setPreviewInfo] = useState<InvoicePreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  // Submit / Save state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<"draft" | "submit" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load preview data for a project
  const loadProjectPreview = useCallback(async (projId: string) => {
    if (!projId) {
      setPreviewInfo(null);
      setPreviewError(null);
      return;
    }

    setIsLoadingPreview(true);
    setPreviewError(null);
    try {
      const data = await invoicesApi.getInvoicePreview(projId);
      setPreviewInfo(data);

      const existingInv = data.existingInvoice;
      const isEditableExisting = Boolean(
        existingInv && (existingInv.status === "Draft" || existingInv.status === "Rejected")
      );

      if (data.eligible && !data.hasExistingInvoice && data.previewData) {
        setInvoiceNumber(data.previewData.suggestedInvoiceId || "");
        if (data.previewData.suggestedDueDate) {
          const dStr = new Date(data.previewData.suggestedDueDate)
            .toISOString()
            .split("T")[0];
          setDueDate(dStr);
        }
        if (Array.isArray(data.previewData.items) && data.previewData.items.length > 0) {
          setLineItems(
            data.previewData.items.map((it) => ({
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
            }))
          );
        }
      } else if (existingInv && isEditableExisting && !previewDraftStore.hasDraft()) {
        setExistingInvoiceId(existingInv._id);
        if (existingInv.invoiceId) setInvoiceNumber(existingInv.invoiceId);
        if (existingInv.invoiceDate) {
          try {
            setInvoiceDate(new Date(existingInv.invoiceDate).toISOString().split("T")[0]);
          } catch {
            // keep current
          }
        }
        if (existingInv.dueDate) {
          try {
            setDueDate(new Date(existingInv.dueDate).toISOString().split("T")[0]);
          } catch {
            // keep current
          }
        }
        if (existingInv.notes) setNotes(existingInv.notes);
        if (Array.isArray(existingInv.items) && existingInv.items.length > 0) {
          setLineItems(
            existingInv.items.map((it) => ({
              _id: it._id,
              description: it.description || "",
              quantity: Number(it.quantity) || 1,
              rate: Number(it.rate) || 0,
              amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0),
            }))
          );
        }
      }
    } catch (err: any) {
      console.warn("Failed to load invoice preview:", err);
      setPreviewError(err?.message || "Failed to load project invoice preview.");
      setPreviewInfo(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Helper to check if project status is approved
  const isStatusApproved = (s?: string) => {
    const norm = (s || "").trim().toLowerCase();
    return norm === "approved";
  };

  // Restore unsaved draft or fetch approved projects
  useEffect(() => {
    const existingDraft = previewDraftStore.getDraft();
    if (existingDraft) {
      if (existingDraft.existingInvoiceId) setExistingInvoiceId(existingDraft.existingInvoiceId);
      if (existingDraft.projectId) setSelectedProjectId(existingDraft.projectId);
      if (existingDraft.invoiceNumber) setInvoiceNumber(existingDraft.invoiceNumber);
      if (existingDraft.invoiceDate) setInvoiceDate(existingDraft.invoiceDate);
      if (existingDraft.dueDate) setDueDate(existingDraft.dueDate);
      if (existingDraft.notes) setNotes(existingDraft.notes);
      if (Array.isArray(existingDraft.lineItems) && existingDraft.lineItems.length > 0) {
        setLineItems(existingDraft.lineItems);
      }
      if (existingDraft.projectId) {
        loadProjectPreview(existingDraft.projectId);
      }
      return;
    }

    if (!initialProjectId) {
      setIsLoadingProjects(true);
      getVendorProjects()
        .then((projs) => {
          const list = Array.isArray(projs) ? projs : [];
          setApprovedProjects(list);
          const firstApproved = list.find((p) => isStatusApproved(p.status));
          if (firstApproved) {
            setSelectedProjectId(firstApproved._id);
            loadProjectPreview(firstApproved._id);
          }
        })
        .catch((err) => {
          console.warn("Failed to load projects:", err);
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    } else {
      setSelectedProjectId(initialProjectId);
      loadProjectPreview(initialProjectId);
    }
  }, [initialProjectId, loadProjectPreview]);

  // Line item change handlers
  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: "description" | "quantity" | "rate",
    value: string
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "description") {
        item.description = value;
      } else if (field === "quantity") {
        item.quantity = value === "" ? 0 : Number(value);
      } else if (field === "rate") {
        item.rate = value === "" ? 0 : Number(value);
      }

      const q = Number(item.quantity) || 0;
      const r = Number(item.rate) || 0;
      item.amount = Math.round(q * r * 100) / 100;

      updated[index] = item;
      return updated;
    });
  };

  // Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  }, [lineItems]);

  const tax = 0; // Strictly zero per business rules
  const totalAmount = subtotal + tax;

  // Validation
  const validateForm = (isSubmittingAction: boolean) => {
    if (!selectedProjectId) {
      return "Please select an approved project to invoice.";
    }

    if (lineItems.length === 0) {
      return "At least one line item is required.";
    }

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (!it.description.trim()) {
        return `Line item #${i + 1} requires a valid description.`;
      }
      if (Number(it.quantity) <= 0) {
        return `Line item #${i + 1} quantity must be greater than 0.`;
      }
      if (Number(it.rate) < 0) {
        return `Line item #${i + 1} rate cannot be negative.`;
      }
    }

    if (dueDate && invoiceDate) {
      const dDue = new Date(dueDate);
      const dInv = new Date(invoiceDate);
      if (!isNaN(dDue.getTime()) && !isNaN(dInv.getTime()) && dDue < dInv) {
        return "Due date cannot be earlier than invoice date.";
      }
    }

    if (isSubmittingAction) {
      if (!dueDate) {
        return "Due date is required when submitting an invoice for review.";
      }
      if (totalAmount <= 0) {
        return "Total invoice amount must be greater than zero for submission.";
      }
    }

    return null;
  };

  // Unsaved Preview handler (passes draft in-memory WITHOUT backend persistence)
  const handlePreview = () => {
    setFormError(null);
    const err = validateForm(false);
    if (err) {
      setFormError(err);
      Alert.alert("Validation Error", err);
      return;
    }

    const payloadItems = lineItems.map((it) => ({
      description: it.description.trim(),
      quantity: Number(it.quantity) || 1,
      rate: Number(it.rate) || 0,
      amount: Math.round((Number(it.quantity) || 1) * (Number(it.rate) || 0) * 100) / 100,
    }));

    // Derive project metadata for in-memory display
    const selectedProjItem = approvedProjects.find((p) => p._id === selectedProjectId);
    const resolvedProjectObj = previewInfo?.previewData?.project || {
      id: selectedProjectId,
      projectId: selectedProjItem?.projectId || "PRJ",
      projectName: selectedProjItem?.projectName || "Field Services",
      client: selectedProjItem?.client || "Client",
      location: selectedProjItem?.location || "",
      status: selectedProjItem?.status || "Approved",
    };

    previewDraftStore.setDraft({
      existingInvoiceId: existingInvoiceId || undefined,
      projectId: selectedProjectId,
      projectObj: resolvedProjectObj,
      vendorObj: previewInfo?.previewData?.vendor || undefined,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      dueDate,
      notes: notes.trim(),
      lineItems: payloadItems,
      subtotal,
      tax: 0,
      totalAmount,
    });

    router.push({
      pathname: "/(app)/invoice-preview",
      params: { mode: "unsaved" },
    });
  };

  // Save Draft handler (persists to backend with status: "Draft")
  const handleSaveDraft = async () => {
    setFormError(null);
    const err = validateForm(false);
    if (err) {
      setFormError(err);
      Alert.alert("Validation Error", err);
      return;
    }

    const payloadItems = lineItems.map((it) => ({
      description: it.description.trim(),
      quantity: Number(it.quantity) || 1,
      rate: Number(it.rate) || 0,
      amount: Math.round((Number(it.quantity) || 1) * (Number(it.rate) || 0) * 100) / 100,
    }));

    setIsSubmitting(true);
    setSubmittingAction("draft");

    try {
      let result: InvoiceListItem;
      if (existingInvoiceId) {
        result = await invoicesApi.updateInvoice(existingInvoiceId, {
          items: payloadItems,
          invoiceDate: invoiceDate || undefined,
          dueDate: dueDate || undefined,
          notes: notes.trim() || undefined,
          submit: false,
        });
      } else {
        result = await invoicesApi.createInvoice({
          projectId: selectedProjectId,
          invoiceId: invoiceNumber.trim() || undefined,
          items: payloadItems,
          invoiceDate: invoiceDate || undefined,
          dueDate: dueDate || undefined,
          notes: notes.trim() || undefined,
          status: "Draft",
        });
      }

      previewDraftStore.clearDraft();
      setExistingInvoiceId(result._id);

      Alert.alert(
        "Draft Saved",
        `Invoice draft (${result.invoiceId || "Draft"}) saved successfully.`,
        [
          {
            text: "View Preview",
            onPress: () => {
              router.replace({
                pathname: "/(app)/invoice-preview",
                params: { id: result._id },
              });
            },
          },
          {
            text: "Continue Editing",
            style: "cancel",
          },
        ]
      );
    } catch (apiErr: any) {
      const message =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        "Failed to save invoice draft.";
      setFormError(message);
      Alert.alert("Draft Error", message);
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };


  const projectObj = previewInfo?.previewData?.project;
  const isEligible = previewInfo?.eligible ?? true;
  const hasExisting = previewInfo?.hasExistingInvoice ?? false;
  const existingInv = previewInfo?.existingInvoice;
  const isEditableExisting = Boolean(
    existingInv && (existingInv.status === "Draft" || existingInv.status === "Rejected")
  );
  const disableForm = !isEligible || (hasExisting && !isEditableExisting) || isLoadingPreview;

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Raise Invoice"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingPreview}
            onRefresh={() => loadProjectPreview(selectedProjectId)}
            colors={["#928880"]}
            tintColor="#928880"
          />
        }
      >
        {/* Project Selector if no initial ID provided */}
        {!initialProjectId && (
          <View style={styles.projectSelectorCard}>
            <Text style={styles.selectorLabel}>Select Approved Project</Text>
            {isLoadingProjects ? (
              <ActivityIndicator size="small" color="#928880" style={{ marginVertical: 8 }} />
            ) : approvedProjects.length === 0 ? (
              <Text style={styles.emptyProjectsText}>
                No approved projects available for invoicing.
              </Text>
            ) : (
              <View style={styles.pillsRow}>
                {approvedProjects.map((p) => {
                  const isSelected = p._id === selectedProjectId;
                  const isAppr = isStatusApproved(p.status);
                  return (
                    <Pressable
                      key={p._id}
                      style={[
                        styles.projectPill,
                        isSelected && styles.projectPillSelected,
                        !isAppr && styles.projectPillDisabled,
                      ]}
                      onPress={() => {
                        setSelectedProjectId(p._id);
                        loadProjectPreview(p._id);
                      }}
                      disabled={!isAppr}
                    >
                      <Text
                        style={[
                          styles.projectPillText,
                          isSelected && styles.projectPillTextSelected,
                        ]}
                      >
                        {p.projectId || "PRJ"} ({p.projectName}) {isAppr ? "✓" : `[${p.status}]`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Loading state for preview */}
        {isLoadingPreview && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#928880" />
            <Text style={styles.loadingBannerText}>Validating project eligibility...</Text>
          </View>
        )}

        {/* Ineligible Project Warning Banner */}
        {!isLoadingPreview && previewInfo && !isEligible && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={20} color="#D97706" />
            <View style={styles.bannerTextCol}>
              <Text style={styles.warningTitle}>Project Ineligible</Text>
              <Text style={styles.warningText}>
                {previewInfo.eligibilityReason || "Only Admin-approved projects can be invoiced."}
              </Text>
            </View>
          </View>
        )}

        {/* Editable Existing Invoice Notice Banner */}
        {!isLoadingPreview && previewInfo && hasExisting && isEditableExisting && (
          <View
            style={[
              styles.editNoticeBanner,
              existingInv?.status === "Rejected" && styles.editNoticeBannerRejected,
            ]}
          >
            <Ionicons
              name={existingInv?.status === "Rejected" ? "alert-circle-outline" : "create-outline"}
              size={20}
              color={existingInv?.status === "Rejected" ? "#DC2626" : "#2563EB"}
            />
            <View style={styles.bannerTextCol}>
              <Text
                style={[
                  styles.editNoticeTitle,
                  existingInv?.status === "Rejected" && { color: "#DC2626" },
                ]}
              >
                {existingInv?.status === "Rejected"
                  ? "Editing Rejected Invoice"
                  : "Editing Saved Draft"}
              </Text>
              <Text style={styles.editNoticeText}>
                {existingInv?.status === "Rejected"
                  ? `Reason: ${existingInv.rejectionReason || "Please adjust line items and resubmit."}`
                  : `Invoice ${existingInv?.invoiceId || ""} is saved in Draft status. You can edit line items below.`}
              </Text>
            </View>
          </View>
        )}

        {/* Existing Non-editable Invoice Found Banner */}
        {!isLoadingPreview && previewInfo && hasExisting && !isEditableExisting && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
            <View style={styles.bannerTextCol}>
              <Text style={styles.infoTitle}>Invoice Already Generated</Text>
              <Text style={styles.infoText}>
                An invoice ({existingInv?.invoiceId}) has already been raised for this project (Status: {existingInv?.status}).
              </Text>
              {existingInv && (
                <Pressable
                  style={styles.viewExistingButton}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/invoice-preview",
                      params: { id: existingInv._id },
                    })
                  }
                >
                  <Text style={styles.viewExistingButtonText}>
                    View Existing Invoice Preview →
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Preview Error Banner */}
        {previewError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.errorBannerText}>{previewError}</Text>
          </View>
        )}

        {/* Form Error Banner */}
        {formError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        )}

        {/* 1. Project Status Banner */}
        {projectObj && (
          <ProjectApprovedBanner
            projectCode={projectObj.projectId || "PRJ"}
            projectName={projectObj.projectName}
            location={projectObj.location}
            status={projectObj.status}
          />
        )}

        {/* 2. Project Reference Card */}
        {projectObj && (
          <ProjectReferenceCard
            workOrder={projectObj.projectId || "—"}
            propertyAddress={projectObj.location || "—"}
            clientName={projectObj.client || "—"}
            completedDate={
              previewInfo?.previewData?.suggestedDueDate || undefined
            }
          />
        )}

        {/* 3. Invoice Details Form */}
        <InvoiceDetailsForm
          invoiceNumber={invoiceNumber}
          onInvoiceNumberChange={setInvoiceNumber}
          clientName={projectObj?.client || "Client"}
          invoiceDate={invoiceDate}
          onInvoiceDateChange={setInvoiceDate}
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          notes={notes}
          onNotesChange={setNotes}
          editable={!disableForm}
        />

        {/* 4. Line Items */}
        <InvoiceLineItems
          items={lineItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={handleUpdateItem}
          editable={!disableForm}
        />

        {/* 5. Financial Summary */}
        <InvoiceSummary subtotal={subtotal} total={totalAmount} />

        {/* 6. Upload Custom Invoice Notice (UI-only) */}
        <InvoiceUploadNotice />

        {/* 7. Digital Signature Notice */}
        <InvoiceSignatureNotice
          signerName={
            previewInfo?.previewData?.vendor?.contactName ||
            user?.name ||
            "Vendor Partner"
          }
        />

        {/* 8. Bottom Action Buttons */}
        <View style={styles.actionsRow}>
          {/* Save Draft Button */}
          <Pressable
            style={[
              styles.actionButton,
              styles.draftButton,
              (disableForm || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleSaveDraft}
            disabled={disableForm || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Save Draft"
          >
            {isSubmitting && submittingAction === "draft" ? (
              <ActivityIndicator size="small" color="#1F1D1B" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={17} color="#1F1D1B" />
                <Text style={styles.draftButtonText}>Save Draft</Text>
              </>
            )}
          </Pressable>

          {/* Preview Button */}
          <Pressable
            style={[
              styles.actionButton,
              styles.previewButton,
              (disableForm || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handlePreview}
            disabled={disableForm || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Preview Invoice"
          >
            <Ionicons name="eye-outline" size={17} color="#FFFFFF" />
            <Text style={styles.previewButtonText}>Preview</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default RaiseInvoiceScreen;

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
  projectSelectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAE5E1",
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F1D1B",
    marginBottom: 8,
  },
  emptyProjectsText: {
    fontSize: 12,
    color: "#8C827A",
    fontStyle: "italic",
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  projectPill: {
    backgroundColor: "#F6F2EF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  projectPillSelected: {
    backgroundColor: "#928880",
  },
  projectPillDisabled: {
    opacity: 0.4,
  },
  projectPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E655F",
  },
  projectPillTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F6F2EF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  loadingBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6E655F",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  bannerTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
    marginBottom: 2,
  },
  warningText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
    lineHeight: 16,
  },
  viewExistingButton: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewExistingButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  editNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  editNoticeBannerRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  editNoticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 2,
  },
  editNoticeText: {
    fontSize: 12,
    color: "#1E3A8A",
    lineHeight: 16,
  },
  draftButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D6CCC5",
  },
  draftButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1D1B",
  },
  previewButton: {
    backgroundColor: "#8C827A",
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
