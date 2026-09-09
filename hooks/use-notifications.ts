"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api/notifications";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    ["notifications", "list", params] as const,
};

export function useNotificationsQuery(
  params: { page?: number; limit?: number; isRead?: boolean } = { limit: 15 },
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => getNotifications(params),
    enabled,
    refetchInterval: 30000, // Background poll every 30 seconds for live updates
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}
