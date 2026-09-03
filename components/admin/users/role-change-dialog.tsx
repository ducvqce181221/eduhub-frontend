"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import type { User, Role } from "@/types/api";

interface RoleChangeDialogProps {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: Role) => Promise<void> | void;
}

export function RoleChangeDialog({
  open,
  user,
  onOpenChange,
  onConfirm,
}: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setErrorMessage(null);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm(selectedRole);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-bold text-neutral-900">
            Change Role for {user.fullName}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Select a new authorization tier for {user.email}.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-xs font-semibold text-neutral-700">
              Assigned Role
            </Label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 shadow-2xs focus:border-[#0075de] focus:outline-none"
            >
              <option value="STUDENT">STUDENT — Regular course learner</option>
              <option value="TEACHER">TEACHER — Course creator and curriculum instructor</option>
              <option value="ADMIN">ADMIN — Complete administrative and operational governance</option>
            </select>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <p>
              Modifying an account&apos;s role immediately reshapes their platform permissions, access guards, and capabilities.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium border-neutral-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-[#0075de] hover:bg-[#005bab] text-white text-xs font-medium"
          >
            {isSubmitting ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
