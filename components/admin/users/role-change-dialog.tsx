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
import { useTranslation } from "@/lib/i18n/language-context";
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
  const { t } = useTranslation();
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
      setErrorMessage(err.message || t.admin.userRoleUpdateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-ink">
            {t.admin.changeRoleModalTitle.replace("{name}", user.fullName)}
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted">
            {t.admin.changeRoleModalDesc.replace("{name}", user.email)}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="role-select" className="text-xs font-medium text-ink">
              {t.admin.assignedRoleLabel}
            </Label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as Role)}
              className="w-full h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none [&>option]:bg-surface [&>option]:text-ink"
            >
              <option value="STUDENT">{t.admin.roleStudentOptionDesc}</option>
              <option value="TEACHER">{t.admin.roleTeacherOptionDesc}</option>
              <option value="ADMIN">{t.admin.roleAdminOptionDesc}</option>
            </select>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-hairline bg-canvas-soft p-3 text-xs text-ink-secondary">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-sticker-amber-deep dark:text-amber-300" />
            <p>
              {t.admin.roleChangeNotice}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs font-medium border-hairline text-ink hover:bg-canvas-soft px-4"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-full bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium px-4 shadow-notion-soft"
          >
            {isSubmitting ? t.admin.updatingRole : t.admin.updateRoleBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
