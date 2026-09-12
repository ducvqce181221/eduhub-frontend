"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  useCourseDetailQuery,
  useMyEnrollmentsQuery,
  useEnrollCourseMutation,
  useCoursePreviewVideoQuery,
} from "@/hooks/use-course-catalog";
import { CourseHero } from "@/components/courses/course-hero";
import { CurriculumOutline } from "@/components/courses/curriculum-outline";
import { CourseSmartCTA } from "@/components/courses/course-smart-cta";
import { CoursePreviewModal } from "@/components/courses/course-preview-modal";
import { useTranslation } from "@/lib/i18n/language-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Play,
  ShieldAlert,
  Video,
} from "lucide-react";

export default function CourseDetailPage() {
  const routeParams = useParams<{ id: string }>();
  const id = (routeParams?.id as string) || "";
  const router = useRouter();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useCourseDetailQuery(id);

  const { data: previewVideoData, isLoading: isLoadingPreview } =
    useCoursePreviewVideoQuery(id, Boolean(course));

  const hasPreviewVideo = Boolean(
    previewVideoData?.previewUrl || previewVideoData?.videoUrl,
  );

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
            <Skeleton className="h-8 w-3/4 max-w-xl rounded-md" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-80 w-full rounded-lg" />
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
        <div className="w-12 h-12 rounded-lg bg-surface border border-hairline shadow-notion-soft flex items-center justify-center mb-4 text-sticker-orange-deep">
          {isForbidden ? (
            <ShieldAlert className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-ink mb-2">
          {isForbidden
            ? language === "vi"
              ? "Truy cập khóa học chưa xuất bản bị giới hạn"
              : "Unpublished Course Access Restricted"
            : language === "vi"
              ? "Không tìm thấy khóa học"
              : "Course Not Found"}
        </h1>

        <p className="text-xs sm:text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
          {isForbidden
            ? t.course.courseDraftNotice
            : t.course.courseNotFoundNotice}
        </p>

        <Button variant="pill" size="default" asChild>
          <Link href="/#catalog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>{t.course.backToCatalog}</span>
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
      <div className="max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Flowing Notion Document Sheet */}
        <div className="lg:col-span-2 rounded-lg bg-surface border border-hairline shadow-notion-soft divide-y divide-hairline overflow-hidden">
          {/* Mobile Thumbnail & Preview Trigger */}
          <div className="lg:hidden w-full relative aspect-video bg-canvas-soft border-b border-hairline overflow-hidden group">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-canvas-soft">
                <BookOpen className="w-8 h-8 text-ink-muted" />
              </div>
            )}
            {hasPreviewVideo && (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-t from-black/70 via-black/30 to-black/30 hover:from-black/80 hover:via-black/40 hover:to-black/40 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center">
                  <Play className="w-6 h-6 fill-notion-blue text-notion-blue translate-x-0.5" />
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-white drop-shadow-md tracking-tight">
                  {t.course.previewThisCourse}
                </span>
              </button>
            )}
          </div>

          {/* Section 1: What you'll learn */}
          <div className="p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
              {t.course.whatYoullLearn}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm text-ink-secondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>{t.course.highlight1}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>{t.course.highlight2}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>{t.course.highlight3}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-sticker-teal mt-0.5 shrink-0" />
                <span>{t.course.highlight4}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Curriculum Outline Accordion */}
          <div className="p-6 sm:p-7">
            <CurriculumOutline
              chapters={course.chapters || []}
              showSummary
              defaultExpanded={false}
              previewLessonId={previewVideoData?.lessonId}
              onPreviewLesson={() => setIsPreviewOpen(true)}
            />
          </div>

          {/* Section 3: Teacher Bio */}
          <div className="p-6 sm:p-7 flex flex-col gap-4">
            <div className="text-xs font-bold uppercase tracking-wider text-notion-blue">
              {t.course.instructorProfile}
            </div>
            <div className="flex items-start gap-4 pt-1">
              <Avatar className="w-12 h-12 border border-hairline shrink-0">
                {course.teacher?.avatarUrl && (
                  <AvatarImage src={course.teacher.avatarUrl} alt={course.teacher.fullName} />
                )}
                <AvatarFallback className="bg-canvas-soft text-ink font-semibold text-sm">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  {course.teacher?.fullName || "EduHub Instructor"}
                </h3>
                {course.teacher?.email && (
                  <p className="text-xs text-ink-muted">
                    {course.teacher.email}
                  </p>
                )}
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed max-w-xl">
                  Instructor and technical author creating structured, production-ready curriculum for software engineers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 sticky top-20">
          <div className="rounded-lg bg-surface border border-hairline shadow-notion-soft overflow-hidden">
            {/* Thumbnail Preview with Play Overlay */}
            <div className="relative aspect-video w-full bg-canvas-soft border-b border-hairline flex items-center justify-center overflow-hidden group">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-soft p-6 text-center select-none">
                  <div className="w-10 h-10 rounded-md bg-surface border border-hairline flex items-center justify-center text-ink-secondary mb-2">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-ink-muted">{t.course.courseOverview}</span>
                </div>
              )}

              {/* Play Overlay Button for Guest Preview */}
              {hasPreviewVideo && (
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  aria-label={t.course.previewThisCourse}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-t from-black/70 via-black/30 to-black/30 hover:from-black/80 hover:via-black/40 hover:to-black/40 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center">
                    <Play className="w-7 h-7 fill-notion-blue text-notion-blue translate-x-0.5" />
                  </div>
                  <span className="mt-3 text-sm font-bold text-white drop-shadow-md tracking-tight">
                    {t.course.previewThisCourse}
                  </span>
                </button>
              )}
            </div>

            {/* Smart Action Area */}
            <div className="p-5 flex flex-col gap-5">
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
              <div className="flex flex-col gap-2.5 pt-4 border-t border-hairline text-xs text-ink-secondary">
                <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                  {t.course.includedInCourse}
                </span>
                <div className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-notion-blue shrink-0" />
                  <span>{t.course.streamableVideo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sticker-teal shrink-0" />
                  <span>{t.course.downloadableMaterials}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-sticker-purple-deep shrink-0" />
                  <span>{t.course.masteryCertification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span>{t.course.totalLessons.replace("{count}", String(totalLessons))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Preview Video Modal */}
      <CoursePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        courseTitle={course.title}
        courseId={course.id}
        previewData={previewVideoData}
        isLoading={isLoadingPreview}
        isEnrolled={isEnrolled}
        isAuthenticated={Boolean(user)}
        onEnroll={handleEnroll}
      />

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-hairline p-3 sm:p-4 shadow-notion-dropdown">
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
