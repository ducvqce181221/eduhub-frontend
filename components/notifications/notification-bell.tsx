"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Megaphone,
  BookOpen,
  Award,
  CheckCircle2,
  Inbox,
  Loader2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/hooks/use-notifications";
import type { NotificationItem, NotificationType } from "@/types/api";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  let hasClient = true;
  try {
    useQueryClient();
  } catch {
    hasClient = false;
  }

  if (!hasClient) {
    return (
      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer",
          className,
        )}
      >
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  return <NotificationBellContent className={className} />;
}

function NotificationBellContent({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useNotificationsQuery({ limit: 30 });
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = data?.data || [];
  const unreadCount =
    data?.meta?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  const displayedNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAsRead = (item: NotificationItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      markAllMutation.mutate();
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "SYSTEM_BROADCAST":
        return <Megaphone className="h-3.5 w-3.5 text-sticker-purple" />;
      case "COURSE_ENROLLED":
        return <BookOpen className="h-3.5 w-3.5 text-sticker-teal" />;
      case "QUIZ_SUBMITTED":
        return <Award className="h-3.5 w-3.5 text-sticker-orange-deep" />;
      case "COURSE_COMPLETED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-sticker-green" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-ink-muted" />;
    }
  };

  const getIconWrapperClass = (type: NotificationType, isRead: boolean) => {
    if (isRead) {
      return "bg-canvas-soft border-hairline text-ink-muted";
    }
    switch (type) {
      case "SYSTEM_BROADCAST":
        return "bg-sticker-purple/15 border-sticker-purple/25";
      case "COURSE_ENROLLED":
        return "bg-sticker-teal/15 border-sticker-teal/25";
      case "QUIZ_SUBMITTED":
        return "bg-sticker-orange/15 border-sticker-orange/25";
      case "COURSE_COMPLETED":
        return "bg-sticker-green/15 border-sticker-green/25";
      default:
        return "bg-canvas-soft border-hairline";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications (${unreadCount} unread)`}
          className={cn(
            "group relative flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-notion-blue",
            open && "bg-canvas-soft text-ink",
            className,
          )}
        >
          <Bell className="h-4 w-4 text-ink-secondary group-hover:text-ink transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-notion-blue text-[10px] font-mono font-bold text-white tabular-nums ring-2 ring-surface shadow-2xs animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[390px] p-0 rounded-lg bg-surface border border-hairline shadow-notion-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-ink tracking-tight">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-notion-blue/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-notion-blue tabular-nums">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-ink-muted hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer disabled:opacity-50"
            >
              {markAllMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin text-notion-blue" />
              ) : (
                <CheckCheck className="h-3 w-3 text-notion-blue" />
              )}
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Subheader */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-hairline bg-canvas-soft/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                filter === "all"
                  ? "bg-surface text-ink font-semibold shadow-2xs border border-hairline"
                  : "text-ink-muted hover:text-ink hover:bg-surface/60",
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "rounded px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer",
                filter === "unread"
                  ? "bg-surface text-ink font-semibold shadow-2xs border border-hairline"
                  : "text-ink-muted hover:text-ink hover:bg-surface/60",
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-hairline overscroll-contain">
          {isLoading ? (
            <div className="p-10 text-center text-xs text-ink-muted flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 text-notion-blue animate-spin" />
              <span>Loading notifications...</span>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2.5 text-ink-muted">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-soft border border-hairline">
                <Inbox className="h-5 w-5 text-ink-faint" />
              </div>
              <p className="text-xs font-semibold text-ink">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-[11px] text-ink-muted max-w-[220px]">
                {filter === "unread"
                  ? "You have read all received updates."
                  : "Course enrollments, quiz results, and system announcements will appear here."}
              </p>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item)}
                className={cn(
                  "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer",
                  item.isRead
                    ? "bg-surface hover:bg-canvas-soft/60 text-ink-muted"
                    : "bg-notion-blue/[0.04] hover:bg-notion-blue/[0.08] text-ink",
                )}
              >
                {/* Icon wrapper */}
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                    getIconWrapperClass(item.type, item.isRead),
                  )}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs truncate",
                        !item.isRead
                          ? "font-semibold text-ink"
                          : "font-medium text-ink-secondary",
                      )}
                    >
                      {item.title}
                    </p>

                    {/* Unread indicator dot */}
                    {!item.isRead && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-notion-blue"
                        title="Unread"
                      />
                    )}
                  </div>

                  <p className="mt-0.5 text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-ink-faint font-mono tabular-nums">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(item, e)}
                        title="Mark as read"
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-medium text-notion-blue hover:underline transition-opacity"
                      >
                        <Check className="h-3 w-3" />
                        <span>Done</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-hairline bg-canvas-soft/40 px-4 py-2">
          <span className="text-[10px] text-ink-faint">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </span>
          <span className="text-[10px] text-ink-faint">EduHub Platform</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

