import { platformClient } from "./platformClient";

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
  amount: number;
  tax: number;
  totalAmount: number;
  status: "Draft" | "Submitted" | "Pending" | "Approved" | "Sent" | "Paid" | "Rejected";
  invoiceDate?: string;
  dueDate?: string | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  createdAt: string;
  updatedAt?: string;
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

export const invoicesApi = {
  getInvoiceStats,
  getInvoiceOverview,
  getInvoices,
};

export default invoicesApi;
