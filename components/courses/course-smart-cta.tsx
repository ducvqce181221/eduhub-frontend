"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Lock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import type { User } from "@/types/api";
import { cn } from "@/lib/utils";

interface CourseSmartCTAProps {
  courseId: string;
  courseSlug?: string;
  teacherId: string;
  user: User | null;
  isEnrolled: boolean;
  isLoadingEnrollment: boolean;
  onEnroll: () => void;
  className?: string;
}

export function CourseSmartCTA({
  courseId,
  courseSlug,
  teacherId,
  user,
  isEnrolled,
  isLoadingEnrollment,
  onEnroll,
  className,
}: CourseSmartCTAProps) {
  // 1. Guest Visitor (Unauthenticated)
  if (!user) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Button
          size="lg"
          variant="pill"
          className="w-full text-sm font-semibold h-11 cursor-pointer"
          asChild
        >
          <Link href={`/login?redirect=/courses/${courseId}`}>
            <span>Log in to Enroll</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
        <p className="text-xs text-ink-muted text-center leading-relaxed">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-notion-blue font-medium hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    );
  }

  // 2. Teacher (Owner) or Platform Admin
  const isOwner = user.role === "TEACHER" && user.id === teacherId;
  const isAdmin = user.role === "ADMIN";
  const searchParams = useSearchParams();
  const fromAdmin = searchParams?.get("from") === "admin" || isAdmin;

  if (isOwner || isAdmin) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Badge variant="admin" className="px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Authority</span>
            </Badge>
          ) : (
            <Badge variant="teacher" className="px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Course Owner</span>
            </Badge>
          )}
        </div>

        <Button
          size="default"
          variant="pill"
          className="w-full text-xs font-semibold h-10 cursor-pointer shadow-notion-soft"
          asChild
        >
          <Link
            href={
              fromAdmin
                ? `/teacher/courses/${courseId}/builder?from=admin`
                : `/teacher/courses/${courseId}/builder`
            }
          >
            <Edit3 className="w-4 h-4 mr-2" />
            <span>Edit in Course Builder</span>
          </Link>
        </Button>

        {fromAdmin && (
          <Button
            size="default"
            variant="outline"
            className="w-full text-xs font-medium h-9 rounded-md border-hairline bg-surface text-ink hover:bg-canvas-soft cursor-pointer"
            asChild
          >
            <Link href="/admin/courses">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Course Oversight</span>
            </Link>
          </Button>
        )}

        <p className="text-xs text-ink-muted text-center leading-relaxed">
          Manage curriculum, upload lesson videos, and update publish status.
        </p>
      </div>
    );
  }

  // 3. Non-owner Teacher
  if (user.role === "TEACHER" && !isOwner) {
    return (
      <div className={cn("flex flex-col gap-2.5 p-3.5 rounded-lg bg-canvas-soft border border-hairline", className)}>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-surface text-ink-secondary border-hairline font-medium">
            Teacher Preview Mode
          </Badge>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          You are exploring this course as an instructor. Per platform policy, only enrolled students take quizzes and earn completion credits.
        </p>
      </div>
    );
  }

  // 4. Student (Already Enrolled)
  if (isEnrolled) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="flex items-center gap-2">
          <Badge variant="teal" className="px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Enrolled Student</span>
          </Badge>
        </div>

        <Button
          size="lg"
          variant="pill"
          className="w-full text-sm font-semibold h-11 cursor-pointer"
          asChild
        >
          <Link href={`/learn/${courseId}`}>
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>

        <p className="text-xs text-ink-muted text-center">
          Track your progress and continue from where you left off.
        </p>
      </div>
    );
  }

  // 5. Student (Not Enrolled Yet)
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button
        size="lg"
        variant="pill"
        onClick={onEnroll}
        disabled={isLoadingEnrollment}
        className="w-full text-sm font-semibold h-11 cursor-pointer"
      >
        {isLoadingEnrollment ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Enrolling...</span>
          </>
        ) : (
          <>
            <GraduationCap className="w-4 h-4 mr-2" />
            <span>Enroll in Course</span>
          </>
        )}
      </Button>

      <p className="text-xs text-ink-muted text-center leading-relaxed">
        Instant lifetime access • Video streams & assessments included
      </p>
    </div>
  );
}
