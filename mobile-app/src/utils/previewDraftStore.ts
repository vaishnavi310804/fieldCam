import { InvoiceLineItem, InvoiceListItem } from "@/src/api/invoices.api";

export interface UnsavedInvoiceDraft {
  existingInvoiceId?: string;
  projectId: string;
  projectObj?: {
    _id?: string;
    id?: string;
    projectId?: string;
    projectName?: string;
    client?: string;
    location?: string;
    status?: string;
    deadline?: string;
  };
  vendorObj?: {
    _id?: string;
    companyName?: string;
    contactName?: string;
    location?: string;
  };
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
}

let currentDraft: UnsavedInvoiceDraft | null = null;

export const previewDraftStore = {
  setDraft: (draft: UnsavedInvoiceDraft): void => {
    currentDraft = draft;
  },

  getDraft: (): UnsavedInvoiceDraft | null => {
    return currentDraft;
  },

  clearDraft: (): void => {
    currentDraft = null;
  },

  hasDraft: (): boolean => {
    return currentDraft !== null;
  },

  /**
   * Converts the unsaved in-memory draft into an InvoiceListItem representation
   * for display in InvoicePreviewDetails without persisting to the database.
   */
  toInvoiceListItem: (draft: UnsavedInvoiceDraft, user?: any): InvoiceListItem => {
    const defaultDateStr = new Date().toISOString();
    const vendorCompanyName =
      draft.vendorObj?.companyName || user?.companyName || user?.name || "Vendor Partner";
    const vendorContactName =
      draft.vendorObj?.contactName || user?.name || "Vendor Contact";
    const vendorLoc = draft.vendorObj?.location || "FieldCam Network";

    const projectTitle =
      draft.projectObj?.projectName || "Field Services";
    const projectCode =
      draft.projectObj?.projectId || "PRJ";
    const clientName =
      draft.projectObj?.client || "Client";
    const projLoc =
      draft.projectObj?.location || "Project Location";

    return {
      _id: draft.existingInvoiceId || "draft-unsaved-preview",
      invoiceId: draft.invoiceNumber.trim() || `INV-${projectCode}`,
      projectTitle,
      projectId: {
        _id: draft.projectId,
        projectId: projectCode,
        projectName: projectTitle,
        client: clientName,
        location: projLoc,
        status: draft.projectObj?.status || "Approved",
        deadline: draft.dueDate || draft.projectObj?.deadline,
      },
      vendorId: {
        _id: draft.vendorObj?._id || "",
        companyName: vendorCompanyName,
        contactName: vendorContactName,
        location: vendorLoc,
      },
      vendorName: vendorCompanyName,
      items: draft.lineItems,
      subtotal: draft.subtotal,
      amount: draft.subtotal,
      tax: 0,
      totalAmount: draft.totalAmount,
      status: "Draft",
      invoiceDate: draft.invoiceDate || defaultDateStr,
      dueDate: draft.dueDate || null,
      notes: draft.notes,
      createdAt: draft.invoiceDate || defaultDateStr,
      updatedAt: defaultDateStr,
    };
  },
};
