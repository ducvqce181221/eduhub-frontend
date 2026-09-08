"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requireAuth allowedRoles={["TEACHER", "ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
