"use client";

import React from "react";
import { Search, UserCog, Power } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
          <Badge className="border border-sticker-purple/20 bg-sticker-purple/15 text-sticker-purple font-semibold text-[11px] rounded-full px-2.5 py-0.5">
            ADMIN
          </Badge>
        );
      case "TEACHER":
        return (
          <Badge className="border border-sticker-sky/20 bg-sticker-sky/15 text-sticker-sky-deep font-semibold text-[11px] rounded-full px-2.5 py-0.5">
            TEACHER
          </Badge>
        );
      default:
        return (
          <Badge className="border border-hairline bg-canvas-soft text-ink-secondary font-medium text-[11px] rounded-full px-2.5 py-0.5">
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
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-surface rounded-md border-hairline text-xs text-ink placeholder:text-ink-muted focus-visible:ring-notion-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => onRoleFilterChange(e.target.value as Role | "ALL")}
            className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none"
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
            className="h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-notion-soft">
        <Table className="border-0 rounded-none">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  Loading accounts...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-xs text-ink-muted"
                >
                  No user accounts match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentAdmin = currentAdminId === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className="transition-colors hover:bg-canvas-soft/50"
                  >
                    {/* Name & Email */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-full border border-hairline">
                          {user.avatarUrl ? (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                          ) : (
                            <AvatarFallback className="text-[11px] font-semibold text-ink-muted bg-canvas-soft">
                              {getInitials(user.fullName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-ink">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role Badge */}
                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    {/* Status Indicator */}
                    <TableCell>
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sticker-teal/15 px-2.5 py-0.5 text-[11px] font-medium text-sticker-teal border border-sticker-teal/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-sticker-teal" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-0.5 text-[11px] font-medium text-ink-muted border border-hairline">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-muted/50" />
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-ink-muted font-mono tabular-nums text-xs">
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
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onChangeRole(user)}
                          className="h-7 rounded-md px-2 text-[11px] font-medium text-ink border-hairline hover:bg-canvas-soft"
                        >
                          <UserCog className="mr-1 h-3 w-3 text-ink-muted" />
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
                              ? "cursor-not-allowed opacity-50 text-ink-muted border-hairline"
                              : user.isActive
                                ? "text-rose-600 hover:bg-rose-500/10 hover:border-rose-300 border-hairline"
                                : "bg-notion-blue hover:bg-notion-blue-hover text-white"
                          }`}
                        >
                          <Power className="mr-1 h-3 w-3" />
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-hairline bg-canvas-soft/40 p-3">
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
