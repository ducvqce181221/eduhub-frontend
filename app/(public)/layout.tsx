"use client";

import React from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard guestOnly>{children}</RoleGuard>;
}
