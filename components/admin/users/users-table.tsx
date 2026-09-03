"use client";

import React from "react";
import { Search, Shield, UserCog, Power, UserCheck, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/common/pagination";
import type { User, PaginationMeta, Role } from "@/types/api";

interface UsersTableProps {
  users: User[];
  meta?: PaginationMeta;
  currentAdminId?: string;
  searchQuery?: string;
  selectedRole?: Role | "ALL";
  selectedStatus?: "ALL" | "ACTIVE" | "INACTIVE";
  onSearchChange: (query: string) => void;
  onRoleFilterChange: (role: Role | "ALL") => void;
  onStatusFilterChange: (status: "ALL" | "ACTIVE" | "INACTIVE") => void;
  onPageChange: (page: number) => void;
  onChangeRole: (user: User) => void;
  onToggleStatus: (user: User) => void;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  meta,
  currentAdminId,
  searchQuery = "",
  selectedRole = "ALL",
  selectedStatus = "ALL",
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onPageChange,
  onChangeRole,
  onToggleStatus,
  isLoading = false,
}: UsersTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="border-purple-200 bg-purple-50 text-purple-700 font-semibold text-[11px] rounded-full px-2.5 py-0.5">
            ADMIN
          </Badge>
        );
      case "TEACHER":
        return (
          <Badge className="border-sky-200 bg-sky-50 text-[#0075de] font-semibold text-[11px] rounded-full px-2.5 py-0.5">
            TEACHER
          </Badge>
        );
      default:
        return (
          <Badge className="border-neutral-200 bg-neutral-100 text-neutral-700 font-medium text-[11px] rounded-full px-2.5 py-0.5">
            STUDENT
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-white rounded-lg border-neutral-200 text-xs focus-visible:ring-[#0075de]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => onRoleFilterChange(e.target.value as Role | "ALL")}
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 shadow-2xs focus:border-[#0075de] focus:outline-none"
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) =>
              onStatusFilterChange(
                e.target.value as "ALL" | "ACTIVE" | "INACTIVE",
              )
            }
            className="h-9 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 shadow-2xs focus:border-[#0075de] focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-[#f6f5f4] text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-xs text-neutral-400"
                  >
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-xs text-neutral-400"
                  >
                    No user accounts match your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentAdmin = currentAdminId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-neutral-50/70"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-full border border-neutral-200">
                            {user.avatarUrl ? (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.fullName}
                              />
                            ) : (
                              <AvatarFallback className="text-[11px] font-bold text-neutral-700">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {user.fullName}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>

                      {/* Status Indicator */}
                      <td className="py-3.5 px-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-neutral-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onChangeRole(user)}
                            className="h-7 rounded-md px-2 text-[11px] font-medium text-neutral-700 hover:bg-neutral-100"
                          >
                            <UserCog className="mr-1 h-3 w-3 text-neutral-500" />
                            Role
                          </Button>

                          <Button
                            variant={user.isActive ? "outline" : "default"}
                            size="sm"
                            disabled={isCurrentAdmin}
                            title={
                              isCurrentAdmin
                                ? "You cannot deactivate your own account"
                                : user.isActive
                                  ? "Deactivate Account"
                                  : "Activate Account"
                            }
                            data-testid={`toggle-status-${user.id}`}
                            onClick={() => onToggleStatus(user)}
                            className={`h-7 rounded-md px-2 text-[11px] font-medium transition ${
                              isCurrentAdmin
                                ? "cursor-not-allowed opacity-50 text-neutral-400 border-neutral-200"
                                : user.isActive
                                  ? "text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            <Power className="mr-1 h-3 w-3" />
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-neutral-100 bg-neutral-50/50 p-4">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
