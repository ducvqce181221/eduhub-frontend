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
import { useTranslation } from "@/lib/i18n/language-context";
import {
  getUsers,
  getUserStats,
  createUser,
  updateUserRole,
  updateUserStatus,
} from "@/lib/api/admin";
import type { User, Role, CreateUserPayload } from "@/types/api";

export default function AdminUsersPage() {
  const { t } = useTranslation();
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

  // Platform Overall Stats Query
  const { data: stats } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: () => getUserStats(),
  });

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
      toast.success(t.admin.userCreatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.userCreateFailed);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      toast.success(t.admin.userRoleUpdatedSuccess);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      setSelectedUserForRole(null);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.userRoleUpdateFailed);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateUserStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(
        vars.isActive
          ? t.admin.accountActivatedSuccess
          : t.admin.accountDeactivatedSuccess,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-stats"] });
      setSelectedUserForStatus(null);
    },
    onError: (err: any) => {
      toast.error(err.message || t.admin.accountStatusUpdateFailed);
    },
  });

  // Calculate Metrics from platform-wide stats (fallback to current data if loading)
  const totalCount = stats?.total ?? meta?.total ?? users.length;
  const teacherCount = stats?.teachers ?? users.filter((u) => u.role === "TEACHER").length;
  const studentCount = stats?.students ?? users.filter((u) => u.role === "STUDENT").length;
  const inactiveCount = stats?.inactive ?? users.filter((u) => !u.isActive).length;

  return (
    <div className="flex flex-col min-h-full">
      <AdminHeader
        title={t.admin.userManagementTitle}
        breadcrumb={t.admin.userManagementBreadcrumb}
      />

      <div className="flex-1 space-y-6 p-6 sm:p-8 pb-16 sm:pb-20">
        {/* Top Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {t.admin.platformAccounts}
            </h2>
            <p className="text-xs text-ink-muted">
              {t.admin.platformAccountsSubtitle}
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium gap-1.5 shadow-notion-soft transition-colors h-9 px-4 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.admin.addAccount}
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
                  {t.admin.totalUsers}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {totalCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-purple/25 border border-sticker-purple/40 text-sticker-purple-deep dark:text-purple-300 dark:border-purple-500/30 dark:bg-purple-500/15">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.teachers}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {teacherCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-teal/15 border border-sticker-teal/20 text-sticker-teal dark:text-teal-300 dark:border-teal-500/30 dark:bg-teal-500/15">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.students}
                </p>
                <h3 className="text-xl font-semibold tracking-tight text-ink font-mono tabular-nums">
                  {studentCount}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4 shadow-notion-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sticker-amber/15 border border-sticker-amber/20 text-sticker-amber-deep dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/15">
                <UserX className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {t.admin.inactive}
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
