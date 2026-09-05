"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, GraduationCap, Shield, UserX, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { RoleChangeDialog } from "@/components/admin/users/role-change-dialog";
import { StatusToggleDialog } from "@/components/admin/users/status-toggle-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
} from "@/lib/api/admin";
import type { User, Role, CreateUserPayload } from "@/types/api";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  // Search & Filter State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );

  // Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(
    null,
  );
  const [selectedUserForStatus, setSelectedUserForStatus] =
    useState<User | null>(null);

  // Data Query
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, limit, search, roleFilter, statusFilter],
    queryFn: () =>
      getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        isActive:
          statusFilter === "ALL"
            ? undefined
            : statusFilter === "ACTIVE"
              ? true
              : false,
      }),
  });

  const users = data?.users || [];
  const meta = data?.meta;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("User account created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUserForRole(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isActive
          ? "Account activated successfully"
          : "Account deactivated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUserForStatus(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  // Calculate Metrics from current data
  const totalCount = meta?.total || users.length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title="User Management"
        breadcrumb="Administration / Users"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Platform Accounts
            </h2>
            <p className="text-xs text-ink-muted">
              Govern registered students, instructors, and system administrators.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium gap-1.5 shadow-notion-soft transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Account
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-canvas-soft border border-hairline text-ink-muted">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Total Users
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {totalCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-purple/15 border border-sticker-purple/20 text-sticker-purple">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Teachers
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {teacherCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-teal/15 border border-sticker-teal/20 text-sticker-teal">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Students
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {studentCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-amber/15 border border-sticker-amber/20 text-sticker-amber-deep">
                <UserX className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Inactive
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {inactiveCount}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Users Data Table */}
        <UsersTable
          users={users}
          meta={meta}
          currentAdminId={currentAdmin?.id}
          searchQuery={search}
          selectedRole={roleFilter}
          selectedStatus={statusFilter}
          onSearchChange={(q) => {
            setSearch(q);
            setPage(1);
          }}
          onRoleFilterChange={(r) => {
            setRoleFilter(r);
            setPage(1);
          }}
          onStatusFilterChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          onPageChange={setPage}
          onChangeRole={(u) => setSelectedUserForRole(u)}
          onToggleStatus={(u) => setSelectedUserForStatus(u)}
          isLoading={isLoading}
        />
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
      />

      <RoleChangeDialog
        open={!!selectedUserForRole}
        user={selectedUserForRole}
        onOpenChange={(open) => !open && setSelectedUserForRole(null)}
        onConfirm={async (newRole) => {
          if (selectedUserForRole) {
            await roleMutation.mutateAsync({
              id: selectedUserForRole.id,
              role: newRole,
            });
          }
        }}
      />

      <StatusToggleDialog
        open={!!selectedUserForStatus}
        user={selectedUserForStatus}
        onOpenChange={(open) => !open && setSelectedUserForStatus(null)}
        onConfirm={async (isActive) => {
          if (selectedUserForStatus) {
            await statusMutation.mutateAsync({
              id: selectedUserForStatus.id,
              isActive,
            });
          }
        }}
      />
    </div>
  );
}
