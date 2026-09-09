import { apiClient } from "./client";
import type { NotificationItem, NotificationsResponse } from "@/types/api";

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationsResponse> {
  const queryParams: Record<string, any> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.isRead !== undefined) queryParams.isRead = params.isRead;

  const response = await apiClient.get<NotificationItem[]>("/notifications", {
    params: queryParams,
  });

  return {
    data: Array.isArray(response.data) ? response.data : [],
    meta: (response.meta as any) || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      unreadCount: 0,
    },
  };
}

export async function markNotificationAsRead(
  id: string,
): Promise<NotificationItem> {
  const response = await apiClient.patch<NotificationItem>(
    `/notifications/${id}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{
  updatedCount: number;
  message: string;
}> {
  const response = await apiClient.patch<{
    updatedCount: number;
    message: string;
  }>("/notifications/read-all");
  return response.data;
}
