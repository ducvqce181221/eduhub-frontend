"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard requireAuth allowedRoles={["ADMIN"]}>
      <div className="flex min-h-[calc(100vh-4rem)] w-full bg-canvas text-ink antialiased">
        <AdminSidebar />
        <main className="flex flex-1 flex-col min-w-0 bg-canvas">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
