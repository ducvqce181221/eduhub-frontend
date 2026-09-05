"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Megaphone,
  Bell,
  Send,
  AlertTriangle,
  Info,
  Clock,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SendSystemNotificationPayload } from "@/types/api";

const broadcastSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  message: z.string().min(1, "Message is required"),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

interface BroadcastNotificationFormProps {
  onSubmit: (payload: SendSystemNotificationPayload) => Promise<any> | void;
  isSubmitting?: boolean;
}

export function BroadcastNotificationForm({
  onSubmit,
  isSubmitting = false,
}: BroadcastNotificationFormProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<BroadcastFormValues | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const watchedTitle = watch("title");
  const watchedMessage = watch("message");

  const onValidSubmit = (values: BroadcastFormValues) => {
    setPendingValues(values);
    setIsConfirmOpen(true);
  };

  const handleConfirmedDispatch = async () => {
    if (!pendingValues) return;
    try {
      await onSubmit(pendingValues);
      reset();
      setIsConfirmOpen(false);
      setPendingValues(null);
    } catch {
      // Error handled by parent or mutation
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form Section */}
      <div className="rounded-lg border border-hairline bg-surface p-6 shadow-notion-soft">
        <div className="flex items-center gap-3 border-b border-hairline pb-4 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">
              Compose System Announcement
            </h3>
            <p className="text-xs text-ink-muted">
              Dispatch high-priority notifications to all active learners, instructors, and staff.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="broadcast-title"
              className="text-xs font-medium text-ink"
            >
              Announcement Title
            </Label>
            <Input
              id="broadcast-title"
              placeholder="e.g. Scheduled Infrastructure Maintenance"
              {...register("title")}
              className="text-xs border-hairline bg-surface text-ink placeholder:text-ink-muted focus-visible:ring-notion-blue"
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label
              htmlFor="broadcast-message"
              className="text-xs font-medium text-ink"
            >
              Announcement Message
            </Label>
            <Textarea
              id="broadcast-message"
              rows={5}
              placeholder="Provide clear instructions or information for all platform members..."
              {...register("message")}
              className="text-xs border-hairline bg-surface text-ink placeholder:text-ink-muted focus-visible:ring-notion-blue resize-none"
            />
            {errors.message && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="rounded-md border border-hairline bg-canvas-soft p-3 text-xs text-ink-secondary flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-ink-muted mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              System notifications are persistent and stored permanently in each active user&apos;s notification inbox.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white py-2.5 text-xs font-medium gap-2 shadow-notion-soft transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            Broadcast to All Users
          </Button>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-lg border border-hairline bg-surface p-6 shadow-notion-soft flex flex-col">
        <div className="flex items-center gap-2 border-b border-hairline pb-4 mb-5">
          <Eye className="h-4 w-4 text-ink-muted" />
          <h3 className="text-sm font-semibold text-ink">
            Live Learner Notification Preview
          </h3>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="rounded-lg border border-hairline bg-canvas-soft p-4 shadow-notion-soft space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-notion-blue text-white">
                <Bell className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    data-testid="preview-title"
                    className="text-xs font-semibold text-ink truncate"
                  >
                    {watchedTitle || "Your Announcement Title Here"}
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] text-ink-muted shrink-0 font-mono">
                    <Clock className="h-3 w-3" />
                    Just now
                  </span>
                </div>
                <p
                  data-testid="preview-message"
                  className="mt-1 text-xs text-ink-secondary whitespace-pre-wrap leading-relaxed"
                >
                  {watchedMessage ||
                    "Announcement details and instructions will appear here when the learner views their notification inbox."}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] text-ink-muted">
              <span>Channel: Platform In-App Notification</span>
              <span className="font-medium text-sticker-teal">Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sticker-amber/20 bg-sticker-amber/15 text-sticker-amber-deep">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-ink">
                  Confirm Broadcast Announcement
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs text-ink-muted pt-1">
              This message will be sent immediately to all active platform users.
            </DialogDescription>
          </DialogHeader>

          {pendingValues && (
            <div className="rounded-md border border-hairline bg-canvas-soft p-3 text-xs space-y-1 my-2">
              <p className="font-medium text-ink">
                {pendingValues.title}
              </p>
              <p className="text-ink-secondary line-clamp-3">
                {pendingValues.message}
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="text-xs font-medium border-hairline text-ink hover:bg-canvas-soft"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmedDispatch}
              className="bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium"
            >
              {isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
