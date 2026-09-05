import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationBell } from "@/components/notifications/notification-bell";

const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();

vi.mock("@/hooks/use-notifications", () => ({
  useNotificationsQuery: vi.fn(() => ({
    data: {
      data: [
        {
          id: "notif-1",
          userId: "u-1",
          type: "SYSTEM_BROADCAST",
          title: "System Maintenance Notice",
          message: "The platform will undergo scheduled maintenance.",
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "notif-2",
          userId: "u-1",
          type: "COURSE_ENROLLED",
          title: "Welcome to NestJS Masterclass",
          message: "You are successfully enrolled.",
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        unreadCount: 1,
      },
    },
    isLoading: false,
  })),
  useMarkNotificationAsReadMutation: () => ({
    mutate: mockMarkRead,
    isPending: false,
  }),
  useMarkAllNotificationsAsReadMutation: () => ({
    mutate: mockMarkAllRead,
    isPending: false,
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("NotificationBell Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the bell icon and unread count badge", () => {
    renderWithClient(<NotificationBell />);

    const bellBtn = screen.getByRole("button", {
      name: /notifications \(1 unread\)/i,
    });
    expect(bellBtn).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens popover with notification items on click", async () => {
    const user = userEvent.setup();
    renderWithClient(<NotificationBell />);

    const bellBtn = screen.getByRole("button", {
      name: /notifications \(1 unread\)/i,
    });
    await user.click(bellBtn);

    expect(screen.getByText("System Maintenance Notice")).toBeInTheDocument();
    expect(
      screen.getByText("The platform will undergo scheduled maintenance."),
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to NestJS Masterclass")).toBeInTheDocument();
  });

  it("allows marking all notifications as read", async () => {
    const user = userEvent.setup();
    renderWithClient(<NotificationBell />);

    const bellBtn = screen.getByRole("button", {
      name: /notifications \(1 unread\)/i,
    });
    await user.click(bellBtn);

    const markAllBtn = screen.getByRole("button", { name: /mark all read/i });
    await user.click(markAllBtn);

    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("allows clicking an unread notification to mark it as read", async () => {
    const user = userEvent.setup();
    renderWithClient(<NotificationBell />);

    const bellBtn = screen.getByRole("button", {
      name: /notifications \(1 unread\)/i,
    });
    await user.click(bellBtn);

    const unreadItem = screen.getByText("System Maintenance Notice");
    await user.click(unreadItem);

    expect(mockMarkRead).toHaveBeenCalledWith("notif-1");
  });
});
