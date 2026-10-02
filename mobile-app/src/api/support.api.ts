import { platformClient } from "./platformClient";

export interface SupportTicketItem {
  _id: string;
  ticketId: string;
  vendorId?: string | {
    _id: string;
    companyName: string;
    contactName?: string;
  };
  vendorName?: string;
  initials?: string;
  avatarBg?: string;
  projectId?: string | {
    _id: string;
    projectId: string;
    projectName: string;
  };
  subject: string;
  description?: string;
  category: "Technical Issue" | "Billing" | "Account" | "Feature Request" | "General" | string;
  priority: "Low" | "Medium" | "High" | "Urgent" | string;
  status: "Open" | "In Progress" | "Resolved" | "Closed" | string;
  lastUpdate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSupportTicketPayload {
  subject: string;
  description?: string;
  category?: string;
  priority?: string;
  projectId?: string;
}

export interface SupportStatsData {
  totalTickets: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export const getVendorSupportTickets = async (query?: {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
}): Promise<SupportTicketItem[]> => {
  const params = new URLSearchParams();
  if (query?.search && query.search.trim()) {
    params.append("search", query.search.trim());
  }
  if (query?.status && query.status !== "All") {
    params.append("status", query.status);
  }
  if (query?.category && query.category !== "All") {
    params.append("category", query.category);
  }
  if (query?.priority && query.priority !== "All") {
    params.append("priority", query.priority);
  }

  const queryString = params.toString();
  const url = `/support/tickets${queryString ? `?${queryString}` : ""}`;

  const response = await platformClient.get<{
    success: boolean;
    count: number;
    data: SupportTicketItem[];
    message?: string;
  }>(url);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch support tickets");
  }

  return response.data.data || [];
};

export const createSupportTicket = async (
  payload: CreateSupportTicketPayload
): Promise<SupportTicketItem> => {
  const response = await platformClient.post<{
    success: boolean;
    message?: string;
    data: SupportTicketItem;
  }>("/support/tickets", payload);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to create support ticket");
  }

  return response.data.data;
};

export const getSupportStats = async (): Promise<SupportStatsData> => {
  const response = await platformClient.get<{
    success: boolean;
    data: SupportStatsData;
    message?: string;
  }>("/support/stats");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch support statistics");
  }

  return response.data.data;
};
