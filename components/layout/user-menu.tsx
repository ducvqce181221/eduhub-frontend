"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, KeyRound, LogOut, BookOpen, LayoutDashboard, Shield } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "orange";
      case "TEACHER":
        return "purple";
      default:
        return "secondary";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-2 focus:ring-2 focus:ring-notion-blue/30">
        <div className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 border border-hairline">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
            <AvatarFallback className="bg-notion-blue text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium text-ink-secondary pr-1">
            {user.fullName}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-surface border border-hairline shadow-notion-soft" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold leading-none text-ink">{user.fullName}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-2 py-0 h-4.5">
                {user.role}
              </Badge>
            </div>
            <p className="text-xs leading-none text-ink-muted truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-hairline" />

        <DropdownMenuGroup>
          {user.role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer flex items-center text-ink-secondary hover:text-ink">
                <Shield className="mr-2 h-4 w-4 text-ink-muted" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}

          {(user.role === "TEACHER" || user.role === "ADMIN") && (
            <DropdownMenuItem asChild>
              <Link href="/teacher" className="cursor-pointer flex items-center text-ink-secondary hover:text-ink">
                <LayoutDashboard className="mr-2 h-4 w-4 text-ink-muted" />
                <span>Teacher Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/me/enrollments" className="cursor-pointer flex items-center text-ink-secondary hover:text-ink">
              <BookOpen className="mr-2 h-4 w-4 text-ink-muted" />
              <span>My Enrollments</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer flex items-center text-ink-secondary hover:text-ink">
              <UserIcon className="mr-2 h-4 w-4 text-ink-muted" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/change-password" className="cursor-pointer flex items-center text-ink-secondary hover:text-ink">
              <KeyRound className="mr-2 h-4 w-4 text-ink-muted" />
              <span>Change Password</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-hairline" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-sticker-orange focus:text-sticker-orange focus:bg-sticker-orange/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
