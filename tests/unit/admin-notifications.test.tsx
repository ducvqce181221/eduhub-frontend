import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BroadcastNotificationForm } from "@/components/admin/notifications/broadcast-form";

describe("System Broadcast Notification Components (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates empty inputs and prevents broadcast submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<BroadcastNotificationForm onSubmit={onSubmit} isSubmitting={false} />);

    const sendBtn = screen.getByRole("button", { name: /broadcast to all users/i });
    await user.click(sendBtn);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it("updates live preview as admin types announcement title and content", async () => {
    const user = userEvent.setup();

    render(<BroadcastNotificationForm onSubmit={vi.fn()} isSubmitting={false} />);

    const titleInput = screen.getByLabelText(/announcement title/i);
    const messageInput = screen.getByLabelText(/announcement message/i);

    await user.type(titleInput, "Important Security Update");
    await user.type(messageInput, "Please update your password today.");

    // Live preview updates
    expect(screen.getByTestId("preview-title")).toHaveTextContent("Important Security Update");
    expect(screen.getByTestId("preview-message")).toHaveTextContent("Please update your password today.");
  });

  it("opens confirmation dialog with warning and dispatches system notification", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({ success: true });

    render(<BroadcastNotificationForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/announcement title/i), "Database Maintenance");
    await user.type(screen.getByLabelText(/announcement message/i), "Maintenance window Saturday 2 AM.");

    const broadcastBtn = screen.getByRole("button", { name: /broadcast to all users/i });
    await user.click(broadcastBtn);

    // Confirmation dialog appears
    expect(screen.getByText("Confirm Broadcast Announcement")).toBeInTheDocument();
    expect(screen.getByText(/will be sent immediately to all active platform users/i)).toBeInTheDocument();

    const confirmSendBtn = screen.getByRole("button", { name: /confirm & dispatch/i });
    await user.click(confirmSendBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Database Maintenance",
        message: "Maintenance window Saturday 2 AM.",
      });
    });
  });
});
