"use client";

import React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { BroadcastNotificationForm } from "@/components/admin/notifications/broadcast-form";
import { sendSystemNotification } from "@/lib/api/admin";
import type { SendSystemNotificationPayload } from "@/types/api";

export default function AdminNotificationsPage() {
  const broadcastMutation = useMutation({
    mutationFn: (payload: SendSystemNotificationPayload) =>
      sendSystemNotification(payload),
    onSuccess: (res) => {
      toast.success(
        res.message || "System broadcast notification dispatched successfully",
      );
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to dispatch system notification");
    },
  });

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="System Broadcast"
        breadcrumb="Administration / Notifications"
      />

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Platform Notification Broadcast
          </h2>
          <p className="text-xs text-neutral-500">
            Deliver immediate, platform-wide notices, maintenance warnings, or vital service announcements.
          </p>
        </div>

        <BroadcastNotificationForm
          onSubmit={(payload) => broadcastMutation.mutateAsync(payload)}
          isSubmitting={broadcastMutation.isPending}
        />
      </div>
    </div>
  );
}
