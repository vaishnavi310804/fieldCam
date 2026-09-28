import { platformClient } from "./platformClient";

export interface VendorProjectStats {
  assigned: number;
  completed: number;
  waitingForApproval: number;
}

export interface VendorProjectPhoto {
  url: string;
  caption?: string;
  uploadedAt?: string;
}

export interface VendorProjectItem {
  _id: string;
  projectId: string;
  projectName: string;
  serviceTypeName?: string;
  client?: string;
  location?: string;
  status: string;
  createdAt: string;
  photos?: VendorProjectPhoto[];
}

export interface VendorProfileData {
  _id: string;
  companyName: string;
  contactName: string;
  initials?: string;
  avatarBg?: string;
  location?: string;
  rating?: number;
  status?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  projectStats?: VendorProjectStats;
  projects?: VendorProjectItem[];
}

export interface VendorInvoiceItem {
  _id: string;
  invoiceId: string;
  amount: number;
  tax?: number;
  totalAmount: number;
  status: "Draft" | "Submitted" | "Approved" | "Paid" | "Rejected";
  paymentDate?: string;
  createdAt: string;
}

export interface VendorSupportStatsData {
  totalTickets: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponse?: string;
}

export interface VendorDashboardData {
  profile: VendorProfileData;
  invoices: VendorInvoiceItem[];
  supportStats: VendorSupportStatsData;
}

export const getVendorProfile = async (): Promise<VendorProfileData> => {
  const response = await platformClient.get<{
    success: boolean;
    data: VendorProfileData;
    message?: string;
  }>("/vendors/me");

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch vendor profile");
  }

  return response.data.data;
};

export const getVendorInvoices = async (): Promise<VendorInvoiceItem[]> => {
  const response = await platformClient.get<{
    success: boolean;
    data: VendorInvoiceItem[];
    message?: string;
  }>("/invoices");

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Failed to fetch vendor invoices");
  }

  return response.data.data;
};

export const getVendorSupportStats =
  async (): Promise<VendorSupportStatsData> => {
    const response = await platformClient.get<{
      success: boolean;
      data: VendorSupportStatsData;
      message?: string;
    }>("/support/stats");

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to fetch support statistics"
      );
    }

    return response.data.data;
  };

export const getVendorDashboardData =
  async (): Promise<VendorDashboardData> => {
    const [profile, invoices, supportStats] = await Promise.all([
      getVendorProfile(),
      getVendorInvoices(),
      getVendorSupportStats(),
    ]);

    return {
      profile,
      invoices,
      supportStats,
    };
  };

export const dashboardApi = {
  getVendorProfile,
  getVendorInvoices,
  getVendorSupportStats,
  getVendorDashboardData,
};

export default dashboardApi;