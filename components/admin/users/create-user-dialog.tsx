"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateUserPayload } from "@/types/api";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
    ),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void> | void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "TEACHER",
    },
  });

  const handleFormSubmit = async (values: CreateUserFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit(values);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create user account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg bg-surface border border-hairline p-6 shadow-notion-dropdown">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-semibold text-ink">
            Create New Account
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted">
            Provision a new operational account (Teacher or Administrator) directly.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium text-ink">
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Jane Educator"
              {...register("fullName")}
              className="text-xs border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted"
            />
            {errors.fullName && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-ink">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. educator@eduhub.dev"
              {...register("email")}
              className="text-xs border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted"
            />
            {errors.email && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-ink">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars with uppercase, lowercase, number"
              {...register("password")}
              className="text-xs border-hairline bg-surface text-ink focus-visible:ring-notion-blue placeholder:text-ink-muted"
            />
            {errors.password && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-medium text-ink">
              Assigned Role
            </Label>
            <select
              id="role"
              {...register("role")}
              className="w-full h-9 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs text-ink shadow-2xs focus:border-notion-blue focus:outline-none"
            >
              <option value="TEACHER">Teacher (Course Creator & Instructor)</option>
              <option value="ADMIN">Administrator (Full Platform Governance)</option>
              <option value="STUDENT">Student (Standard Learner)</option>
            </select>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-medium border-hairline text-ink hover:bg-canvas-soft"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-notion-blue hover:bg-notion-blue-hover text-white text-xs font-medium"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
