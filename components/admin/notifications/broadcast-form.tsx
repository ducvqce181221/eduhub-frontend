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
  Sparkles,
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
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#0075de]">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Compose System Announcement
            </h3>
            <p className="text-xs text-neutral-500">
              Dispatch high-priority notifications to all active learners, instructors, and staff.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="broadcast-title"
              className="text-xs font-semibold text-neutral-700"
            >
              Announcement Title
            </Label>
            <Input
              id="broadcast-title"
              placeholder="e.g. Scheduled Infrastructure Maintenance"
              {...register("title")}
              className="text-xs border-neutral-200 focus-visible:ring-[#0075de]"
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
              className="text-xs font-semibold text-neutral-700"
            >
              Announcement Message
            </Label>
            <Textarea
              id="broadcast-message"
              rows={5}
              placeholder="Provide clear instructions or information for all platform members..."
              {...register("message")}
              className="text-xs border-neutral-200 focus-visible:ring-[#0075de]"
            />
            {errors.message && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-800 flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-[#0075de] mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              System notifications are persistent and stored permanently in each active user&apos;s notification inbox.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0075de] hover:bg-[#005bab] text-white py-2.5 text-xs font-semibold shadow-2xs transition-all active:scale-98"
          >
            <Send className="h-4 w-4" />
            Broadcast to All Users
          </Button>
        </form>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-5">
          <Sparkles className="h-4 w-4 text-[#0075de]" />
          <h3 className="text-sm font-bold text-neutral-900">
            Live Learner Notification Preview
          </h3>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="rounded-xl border border-neutral-200/90 bg-[#faf9f8] p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0075de] text-white">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    data-testid="preview-title"
                    className="text-xs font-bold text-neutral-900 truncate"
                  >
                    {watchedTitle || "Your Announcement Title Here"}
                  </h4>
                  <span className="flex items-center gap-1 text-[10px] text-neutral-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    Just now
                  </span>
                </div>
                <p
                  data-testid="preview-message"
                  className="mt-1 text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed"
                >
                  {watchedMessage ||
                    "Announcement details and instructions will appear here when the learner views their notification inbox."}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Channel: Platform In-App Notification</span>
              <span className="font-semibold text-emerald-600">Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-xl bg-white p-6 shadow-xl">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-neutral-900">
                  Confirm Broadcast Announcement
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-xs text-neutral-500 pt-1">
              This message will be sent immediately to all active platform users.
            </DialogDescription>
          </DialogHeader>

          {pendingValues && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs space-y-1 my-2">
              <p className="font-semibold text-neutral-900">
                {pendingValues.title}
              </p>
              <p className="text-neutral-600 line-clamp-3">
                {pendingValues.message}
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="text-xs font-medium border-neutral-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmedDispatch}
              className="bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-medium"
            >
              {isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
