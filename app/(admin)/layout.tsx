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
      <div className="flex h-screen w-full overflow-hidden bg-canvas text-ink antialiased">
        <AdminSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto bg-canvas">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
