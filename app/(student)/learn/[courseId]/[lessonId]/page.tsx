"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCourseDetailQuery } from "@/hooks/use-course-catalog";
import {
  useLessonDetailsQuery,
  useLessonProgressQuery,
  useCourseProgressQuery,
  useUpdateProgressMutation,
  useSubmitQuizMutation,
} from "@/hooks/use-student-learning";
import { VideoPlayer } from "@/components/learn/video-player";
import { QuizView } from "@/components/learn/quiz-view";
import { LearningSidebar } from "@/components/learn/learning-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Layers,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import type { QuizAttemptResult, SubmitQuizAnswerPayload } from "@/types/api";

export default function LessonLearnPage() {
  const routeParams = useParams<{ courseId: string; lessonId: string }>();
  const courseId = routeParams?.courseId || "";
  const lessonId = routeParams?.lessonId || "";
  const router = useRouter();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttemptResult | null>(null);

  // Queries
  const { data: course, isLoading: isLoadingCourse } = useCourseDetailQuery(courseId);
  const { data: lesson, isLoading: isLoadingLesson } = useLessonDetailsQuery(lessonId);
  const { data: lessonProgress } = useLessonProgressQuery(lessonId);
  const { data: courseProgress } = useCourseProgressQuery(courseId);

  // Mutations
  const updateProgressMutation = useUpdateProgressMutation(courseId);
  const submitQuizMutation = useSubmitQuizMutation(courseId);

  const handleProgressHeartbeat = (watchedSeconds: number) => {
    updateProgressMutation.mutate({
      lessonId,
      watchedSeconds,
    });
  };

  const handleSubmitQuiz = (answers: SubmitQuizAnswerPayload[]) => {
    if (!lesson?.quiz?.id) return;
    submitQuizMutation.mutate(
      {
        quizId: lesson.quiz.id,
        answers,
      },
      {
        onSuccess: (result) => {
          setLatestAttempt(result);
        },
      },
    );
  };

  const handleSelectLesson = (newLessonId: string) => {
    setLatestAttempt(null);
    setIsMobileSidebarOpen(false);
    router.push(`/learn/${courseId}/${newLessonId}`);
  };

  if (isLoadingCourse || isLoadingLesson) {
    return (
      <div className="flex flex-col flex-1 bg-canvas-soft min-h-[85vh] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center bg-canvas-soft">
        <h2 className="text-xl font-bold text-ink mb-2">Lesson Not Available</h2>
        <p className="text-sm text-ink-muted mb-6">
          Could not load the requested lesson or course.
        </p>
        <Button variant="pill" size="default" asChild>
          <Link href="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  const isLessonCompleted = Boolean(lessonProgress?.isCompleted);

  return (
    <div className="flex flex-col flex-1 bg-canvas-soft min-h-screen">
      {/* Mobile Top Subheader */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-surface border-b border-hairline sticky top-14 z-30">
        <Link
          href={`/courses/${courseId}`}
          className="text-xs font-semibold text-ink-muted flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="truncate max-w-[180px]">{course.title}</span>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="h-8 text-xs gap-1.5 border-hairline"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Curriculum ({courseProgress?.completedLessons || 0}/{courseProgress?.totalLessons || 0})</span>
        </Button>
      </div>

      {/* Main Learning Workspace Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Video Player, Details, Resources & Quiz */}
        <div className="lg:col-span-2 flex flex-col gap-8 min-w-0">
          {/* Video Player */}
          <VideoPlayer
            video={lesson.video}
            lessonTitle={lesson.title}
            initialWatchedSeconds={lessonProgress?.watchedSeconds || 0}
            isCompleted={isLessonCompleted}
            onProgressHeartbeat={handleProgressHeartbeat}
          />

          {/* Lesson Metadata Header */}
          <div className="flex flex-col gap-3 p-6 sm:p-7 rounded-2xl bg-surface border border-hairline shadow-notion-soft">
            <div className="flex flex-wrap items-center gap-2">
              {isLessonCompleted && (
                <Badge variant="teal" className="text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lesson Completed
                </Badge>
              )}
              {lesson.video?.durationSeconds && (
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-canvas-soft border-hairline text-ink-muted">
                  Duration: {Math.floor(lesson.video.durationSeconds / 60)} mins
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              {lesson.title}
            </h1>

            {lesson.description && (
              <p className="text-sm text-ink-secondary leading-relaxed pt-1 border-t border-hairline mt-1">
                {lesson.description}
              </p>
            )}
          </div>

          {/* Downloadable Resources Section */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-hairline shadow-notion-soft flex flex-col gap-4">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-sticker-teal" />
                Downloadable Lesson Resources
              </h3>

              <div className="divide-y divide-hairline border border-hairline rounded-xl overflow-hidden bg-canvas-soft/30">
                {lesson.resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-canvas-soft/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-ink-muted shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-ink truncate">
                        {res.name}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-hairline hover:bg-white shrink-0 gap-1.5"
                      asChild
                    >
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Section (if lesson has a quiz) */}
          {lesson.quiz && (
            <QuizView
              quiz={lesson.quiz as any}
              latestAttempt={latestAttempt}
              isLessonCompleted={isLessonCompleted}
              isSubmitting={submitQuizMutation.isPending}
              onSubmitAttempt={handleSubmitQuiz}
              onRetry={() => setLatestAttempt(null)}
            />
          )}
        </div>

        {/* Right Column: Desktop Learning Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <div className="h-[calc(100vh-6.5rem)]">
            <LearningSidebar
              courseId={course.id}
              courseTitle={course.title}
              chapters={course.chapters || []}
              activeLessonId={lesson.id}
              completedLessonIds={courseProgress?.completedLessonIds || []}
              progressPercentage={courseProgress?.progressPercentage || 0}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm h-full bg-surface shadow-2xl flex flex-col">
            <div className="p-3.5 border-b border-hairline flex items-center justify-between">
              <span className="text-sm font-bold text-ink">Curriculum Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-md text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3">
              <LearningSidebar
                courseId={course.id}
                courseTitle={course.title}
                chapters={course.chapters || []}
                activeLessonId={lesson.id}
                completedLessonIds={courseProgress?.completedLessonIds || []}
                progressPercentage={courseProgress?.progressPercentage || 0}
                onSelectLesson={handleSelectLesson}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
