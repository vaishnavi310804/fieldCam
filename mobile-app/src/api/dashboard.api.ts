import { platformClient } from "./platformClient";

export interface VendorProjectStats {
  assigned: number;
  completed: number;
  waitingForApproval: number;
  active?: number;
  rejected?: number;
}

export interface AIValidationResult {
  status: "PASSED" | "FAILED" | "PENDING";
  clarity?: {
    passed: boolean;
    score?: number;
  };
  lighting?: {
    passed: boolean;
    score?: number;
  };
  subject?: {
    passed: boolean;
    confidence?: number;
    expectedCategory?: string;
    detectedDescription?: string;
    reason?: string;
  };
  reason?: string;
  validatedAt?: string;
}

export interface VendorProjectPhoto {
  _id?: string;
  url: string;
  caption?: string;
  category?: string;
  checklistItemId?: string;
  capturedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  uploadedAt?: string;
  aiValidation?: AIValidationResult;
}

export interface VendorChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface VendorAttachmentItem {
  url: string;
  filename: string;
  size?: number;
  uploadedAt?: string;
}

export interface VendorProjectNote {
  _id: string;
  text: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface VendorProjectItem {
  _id: string;
  projectId: string;
  projectName: string;
  serviceTypeName?: string;
  client?: string;
  vendorName?: string;
  location?: string;
  deadline?: string;
  description?: string;
  rejectionReason?: string;
  reviewComments?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  photos?: VendorProjectPhoto[];
  checklistItems?: VendorChecklistItem[];
  attachments?: VendorAttachmentItem[];
  notes?: VendorProjectNote[];
  progress?: number;
}

export interface VendorProfileData {
  _id: string;
  companyName: string;
  contactName: string;
  initials?: string;
  avatarBg?: string;
  location?: string;
  services?: string[];
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

export interface VendorStaffItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyId?: string;
  status: "ACTIVE" | "INACTIVE" | "Active" | "Inactive" | string;
  isVerified?: boolean;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorTeamMemberItem {
  _id: string;
  companyName?: string;
  contactName?: string;
  initials?: string;
  avatarBg?: string;
  location?: string;
  services?: string[];
  rating?: number;
  status?: string;
  activeProjects?: number;
  completed?: number;
  approval?: number;
  userId?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  };
  projectStats?: VendorProjectStats;
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

export const getVendorProjects = async (): Promise<VendorProjectItem[]> => {
  try {
    const response = await platformClient.get<{
      success: boolean;
      data: VendorProjectItem[];
      message?: string;
    }>("/projects");

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch (err) {
    console.warn("Failed to fetch /projects endpoint, falling back to profile projects:", err);
  }

  const profile = await getVendorProfile();
  return profile.projects || [];
};

export const acceptProject = async (projectId: string): Promise<VendorProjectItem> => {
  const response = await platformClient.patch<{
    success: boolean;
    data: VendorProjectItem;
    message?: string;
  }>(`/projects/${projectId}/accept`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to accept project");
  }

  return response.data.data;
};

export const getProjectById = async (id: string): Promise<VendorProjectItem> => {
  const response = await platformClient.get<{
    success: boolean;
    data: VendorProjectItem;
    message?: string;
  }>(`/projects/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to fetch project details");
  }

  return response.data.data;
};

export const getProjectNotes = async (
  projectId: string
): Promise<VendorProjectNote[]> => {
  const response = await platformClient.get<{
    success: boolean;
    data: VendorProjectNote[];
    message?: string;
  }>(`/projects/${projectId}/notes`);

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Failed to fetch project notes");
  }

  return response.data.data;
};

export const addProjectNote = async (
  projectId: string,
  text: string
): Promise<VendorProjectNote> => {
  const response = await platformClient.post<{
    success: boolean;
    data: VendorProjectNote;
    message?: string;
  }>(`/projects/${projectId}/notes`, { text });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to add project note");
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

export interface UploadPhotoData {
  photoUri: string;
  checklistItemId: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  caption?: string;
}

export interface UploadPhotoResponse {
  photo: VendorProjectPhoto;
  project: VendorProjectItem;
}

export const uploadProjectPhoto = async (
  projectId: string,
  data: UploadPhotoData
): Promise<UploadPhotoResponse> => {
  const formData = new FormData();

  const filename = data.photoUri.split("/").pop() || `photo-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  formData.append("photo", {
    uri: data.photoUri,
    name: filename,
    type: mimeType,
  } as any);

  formData.append("checklistItemId", data.checklistItemId);
  formData.append("capturedAt", data.capturedAt);
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));
  formData.append("accuracy", String(data.accuracy));
  if (data.caption) {
    formData.append("caption", data.caption);
  }

  const response = await platformClient.post<{
    success: boolean;
    message?: string;
    data: UploadPhotoResponse;
  }>(`/projects/${projectId}/photos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to upload photo");
  }

  return response.data.data;
};

export const submitVendorProject = async (
  projectId: string
): Promise<VendorProjectItem> => {
  const response = await platformClient.post<{
    success: boolean;
    data: VendorProjectItem;
    message?: string;
  }>(`/projects/${projectId}/submit`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || "Failed to submit project");
  }

  return response.data.data;
};

export const getVendorStaffList = async (): Promise<VendorStaffItem[]> => {
  const response = await platformClient.get<{
    success: boolean;
    count?: number;
    data: VendorStaffItem[];
    message?: string;
  }>("/vendors/me/staff");

  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || "Failed to fetch vendor staff");
  }

  return response.data.data;
};

export const assignProjectToStaff = async (
  projectId: string,
  staffId: string
): Promise<VendorProjectItem> => {
  const response = await platformClient.post<{
    success: boolean;
    data: VendorProjectItem;
    message?: string;
  }>(`/projects/${projectId}/assign-staff`, { staffId });

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Failed to assign project to staff member"
    );
  }

  return response.data.data;
};

export const downloadProjectReportPdf = async (
  projectId: string
): Promise<ArrayBuffer> => {
  const response = await platformClient.get<ArrayBuffer>(
    `/projects/${projectId}/report/pdf`,
    {
      responseType: "arraybuffer",
    }
  );

  return response.data;
};

export const dashboardApi = {
  getVendorProfile,
  getVendorProjects,
  getVendorInvoices,
  getVendorSupportStats,
  getVendorDashboardData,
  uploadProjectPhoto,
  submitVendorProject,
  getVendorStaffList,
  assignProjectToStaff,
  downloadProjectReportPdf,
};

export default dashboardApi;