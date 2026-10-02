import { platformClient } from "./platformClient";

export interface AuditLogItem {
  _id: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export const getProjectAuditLogs = async (projectId: string): Promise<AuditLogItem[]> => {
  try {
    const response = await platformClient.get<{
      success: boolean;
      data: AuditLogItem[];
      message?: string;
    }>(`/audit-logs/entity/Project/${projectId}`);

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.warn("Failed to fetch project audit logs:", error);
    return [];
  }
};
