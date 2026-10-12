import { platformClient } from "./platformClient";

export interface InvoiceLineItem {
  _id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceStatsData {
  totalInvoiced: number;
  awaitingReview: { count: number; amount: number };
  approvedAwaitingPayment: { count: number; amount: number };
  actualPaidEarnings: { count: number; amount: number };
  overdueUnpaid: { count: number; amount: number };
  paidThisMonth: number;
  drafts: { count: number; amount: number };
  totalOutstanding: number;
  pendingReview: number;
  approved: number;
}

export interface InvoiceOverviewItem {
  month: string;
  amount: number;
  count: number;
  year: number;
  monthNum: number;
}

export interface ReviewHistoryItem {
  _id?: string;
  action: string;
  actorId?: string | null;
  actorRole?: string | null;
  actorEmail?: string | null;
  reason?: string | null;
  timestamp: string;
}

export interface InvoiceListItem {
  _id: string;
  invoiceId: string;
  projectTitle: string;
  projectId?: {
    _id: string;
    projectId?: string;
    projectName?: string;
    client?: string;
    status?: string;
    deadline?: string;
    location?: string;
  };
  vendorId?: {
    _id: string;
    companyName?: string;
    contactName?: string;
    location?: string;
    status?: string;
  };
  vendorName?: string;
  items?: InvoiceLineItem[];
  subtotal?: number;
  amount: number;
  tax: number;
  totalAmount: number;
  status:
    | "Draft"
    | "Submitted"
    | "Pending"
    | "Approved"
    | "Sent"
    | "Paid"
    | "Rejected";
  invoiceDate?: string;
  dueDate?: string | null;
  notes?: string;
  rejectionReason?: string | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  paymentNotes?: string | null;
  paidBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  reviewHistory?: ReviewHistoryItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface InvoicePreviewResponse {
  eligible: boolean;
  eligibilityReason: string;
  hasExistingInvoice: boolean;
  existingInvoice: InvoiceListItem | null;
  previewData?: {
    suggestedInvoiceId: string;
    invoiceDate: string;
    suggestedDueDate: string;
    project: {
      id: string;
      projectId: string;
      projectName: string;
      client: string;
      location: string;
      status: string;
    };
    vendor: {
      id: string;
      companyName: string;
      contactName: string;
      location: string;
    } | null;
    items: InvoiceLineItem[];
    subtotal: number;
    tax: number;
    totalAmount: number;
  };
}

export interface CreateInvoicePayload {
  projectId: string;
  invoiceId?: string;
  items?: InvoiceLineItem[];
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  status?: "Draft" | "Submitted";
}

export interface UpdateInvoicePayload {
  items?: InvoiceLineItem[];
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  submit?: boolean;
}

export const getInvoiceStats = async (): Promise<InvoiceStatsData> => {
  const response = await platformClient.get<{
    success: boolean;
    data: InvoiceStatsData;
    message?: string;
  }>("/invoices/stats");

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch invoice stats");
  }

  return response.data.data;
};

export const getInvoiceOverview = async (): Promise<InvoiceOverviewItem[]> => {
  const response = await platformClient.get<{
    success: boolean;
    data: InvoiceOverviewItem[];
    message?: string;
  }>("/invoices/overview");

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Failed to fetch invoice overview");
  }

  return response.data.data;
};

export const getInvoices = async (
  query?: Record<string, any>
): Promise<InvoiceListItem[]> => {
  const response = await platformClient.get<{
    success: boolean;
    count?: number;
    data: InvoiceListItem[];
    message?: string;
  }>("/invoices", { params: query });

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Failed to fetch invoices");
  }

  return response.data.data;
};

export const getInvoiceById = async (id: string): Promise<InvoiceListItem> => {
  const response = await platformClient.get<{
    success: boolean;
    data: InvoiceListItem;
    message?: string;
  }>(`/invoices/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch invoice details");
  }

  return response.data.data;
};

export const getInvoicePreview = async (
  projectId: string
): Promise<InvoicePreviewResponse> => {
  const response = await platformClient.get<{
    success: boolean;
    data: InvoicePreviewResponse;
    message?: string;
  }>(`/invoices/preview/${projectId}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch invoice preview");
  }

  return response.data.data;
};

export const createInvoice = async (
  payload: CreateInvoicePayload
): Promise<InvoiceListItem> => {
  const response = await platformClient.post<{
    success: boolean;
    data: InvoiceListItem;
    message?: string;
  }>("/invoices", payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create invoice");
  }

  return response.data.data;
};

export const updateInvoice = async (
  id: string,
  payload: UpdateInvoicePayload
): Promise<InvoiceListItem> => {
  const response = await platformClient.put<{
    success: boolean;
    data: InvoiceListItem;
    message?: string;
  }>(`/invoices/${id}`, payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to update invoice");
  }

  return response.data.data;
};

export const submitInvoice = async (id: string): Promise<InvoiceListItem> => {
  const response = await platformClient.post<{
    success: boolean;
    data: InvoiceListItem;
    message?: string;
  }>(`/invoices/${id}/submit`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to submit invoice");
  }

  return response.data.data;
};

export const downloadInvoicePdf = async (id: string): Promise<ArrayBuffer> => {
  const response = await platformClient.get<ArrayBuffer>(`/invoices/${id}/pdf`, {
    responseType: "arraybuffer",
  });

  return response.data;
};

export const invoicesApi = {
  getInvoiceStats,
  getInvoiceOverview,
  getInvoices,
  getInvoiceById,
  getInvoicePreview,
  createInvoice,
  updateInvoice,
  submitInvoice,
  downloadInvoicePdf,
};

export default invoicesApi;
