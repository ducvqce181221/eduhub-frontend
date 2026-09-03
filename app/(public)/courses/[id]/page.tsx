"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useCourseDetailQuery,
  useMyEnrollmentsQuery,
  useEnrollCourseMutation,
} from "@/hooks/use-course-catalog";
import { CourseHero } from "@/components/courses/course-hero";
import { CurriculumOutline } from "@/components/courses/curriculum-outline";
import { CourseSmartCTA } from "@/components/courses/course-smart-cta";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Lock,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";

export default function CourseDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = (routeParams?.id as string) || "";
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useCourseDetailQuery(id);

  const { data: myEnrollments = [], isLoading: isLoadingEnrollments } =
    useMyEnrollmentsQuery(Boolean(user && user.role === "STUDENT"));

  const enrollMutation = useEnrollCourseMutation();

  const isEnrolled = Boolean(
    myEnrollments.some(
      (e) => e.courseId === id || (e.course && e.course.id === id),
    ),
  );

  const handleEnroll = () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }
    enrollMutation.mutate(id);
  };

  // Loading Skeleton State
  if (isLoadingCourse) {
    return (
      <div className="flex flex-col flex-1 bg-canvas-soft">
        <div className="w-full bg-surface border-b border-hairline py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-4">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-8 w-3/4 max-w-xl rounded-lg" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (courseError || !course) {
    const isForbidden = (courseError as any)?.statusCode === 403;

    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center bg-canvas-soft">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-hairline shadow-notion-soft flex items-center justify-center mb-4 text-sticker-orange-deep">
          {isForbidden ? (
            <ShieldAlert className="w-8 h-8" />
          ) : (
            <AlertCircle className="w-8 h-8" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-ink mb-2">
          {isForbidden ? "Unpublished Course Access Restricted" : "Course Not Found"}
        </h1>

        <p className="text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
          {isForbidden
            ? "This course is currently in draft status and can only be previewed by its creator or a platform administrator."
            : "The course you are looking for does not exist, has been removed, or is no longer accessible."}
        </p>

        <Button variant="pill" size="default" asChild>
          <Link href="/#catalog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course Catalog
          </Link>
        </Button>
      </div>
    );
  }

  const teacherInitials = course.teacher?.fullName
    ? course.teacher.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ED";

  const totalLessons = (course.chapters || []).reduce(
    (acc, chap) => acc + (chap.lessons?.length || 0),
    0,
  );

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft pb-24 lg:pb-16">
      {/* Course Hero Banner */}
      <CourseHero course={course} />

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto w-full py-8 sm:py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Course Curriculum & Highlights */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* What you'll learn card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-hairline shadow-notion-soft flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-notion-blue" />
              Course Highlights &amp; Learning Outcomes
            </h2>
            <div className="grid sm:grid-cols-2 gap-3.5 pt-1 text-sm text-ink-secondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>Comprehensive modular curriculum covering enterprise patterns.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>High-definition video streams with adaptive bitrate playback.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>Single-choice mastery assessments graded atomically.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>Strict 90% progress heartbeat synchronization.</span>
              </div>
            </div>
          </div>

          {/* Curriculum Outline Accordion */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-hairline shadow-notion-soft">
            <CurriculumOutline
              chapters={course.chapters || []}
              showSummary
              defaultExpanded={false}
            />
          </div>

          {/* Teacher Bio Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-hairline shadow-notion-soft flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">About the Instructor</h2>
            <div className="flex items-start gap-4 pt-1">
              <Avatar className="w-14 h-14 border border-hairline shrink-0">
                {course.teacher?.avatarUrl && (
                  <AvatarImage src={course.teacher.avatarUrl} alt={course.teacher.fullName} />
                )}
                <AvatarFallback className="bg-canvas-soft text-ink font-bold text-base">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-ink">
                  {course.teacher?.fullName || "EduHub Instructor"}
                </h3>
                <p className="text-xs text-ink-muted">
                  {course.teacher?.email}
                </p>
                <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">
                  Instructor and technical author creating structured, production-ready curriculum for software engineers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-20">
          <div className="rounded-2xl bg-surface border border-hairline shadow-notion-elevated overflow-hidden">
            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full bg-canvas-soft border-b border-hairline flex items-center justify-center overflow-hidden">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-canvas-soft to-accent/30 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center text-notion-blue mb-2 shadow-2xs">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-ink-secondary">Course Overview</span>
                </div>
              )}
            </div>

            {/* Smart Action Area */}
            <div className="p-6 flex flex-col gap-6">
              <CourseSmartCTA
                courseId={course.id}
                courseSlug={course.slug}
                teacherId={course.teacherId}
                user={user}
                isEnrolled={isEnrolled}
                isLoadingEnrollment={enrollMutation.isPending || isLoadingEnrollments}
                onEnroll={handleEnroll}
              />

              {/* Inclusions List */}
              <div className="flex flex-col gap-3 pt-4 border-t border-hairline text-xs text-ink-secondary">
                <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                  This course includes:
                </span>
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-notion-blue shrink-0" />
                  <span>Streamable HD video lessons</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-sticker-teal shrink-0" />
                  <span>Downloadable source materials</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-sticker-purple-deep shrink-0" />
                  <span>Quizzes &amp; Mastery certification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>{totalLessons} total structured lessons</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-hairline p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <CourseSmartCTA
            courseId={course.id}
            courseSlug={course.slug}
            teacherId={course.teacherId}
            user={user}
            isEnrolled={isEnrolled}
            isLoadingEnrollment={enrollMutation.isPending || isLoadingEnrollments}
            onEnroll={handleEnroll}
          />
        </div>
      </div>
    </div>
  );
}
