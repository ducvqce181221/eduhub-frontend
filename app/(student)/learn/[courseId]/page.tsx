"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCourseDetailQuery } from "@/hooks/use-course-catalog";
import { useCourseProgressQuery } from "@/hooks/use-student-learning";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function CourseLearnRedirectPage() {
  const routeParams = useParams<{ courseId: string }>();
  const courseId = routeParams?.courseId || "";
  const router = useRouter();

  const { data: course, isLoading: isLoadingCourse } = useCourseDetailQuery(courseId);
  const { data: progress, isLoading: isLoadingProgress } = useCourseProgressQuery(courseId);

  useEffect(() => {
    if (!course || isLoadingCourse || isLoadingProgress) return;

    // Flatten lessons in order
    const chapters = [...(course.chapters || [])].sort((a, b) => a.order - b.order);
    const allLessons = chapters.flatMap((c) =>
      [...(c.lessons || [])].sort((a, b) => a.order - b.order),
    );

    if (allLessons.length === 0) {
      router.replace(`/courses/${courseId}`);
      return;
    }

    // Find the first uncompleted lesson
    const completedIds = progress?.completedLessonIds || [];
    const firstUncompleted = allLessons.find((l) => !completedIds.includes(l.id));
    const targetLesson = firstUncompleted || allLessons[0];

    router.replace(`/learn/${courseId}/${targetLesson.id}`);
  }, [course, progress, isLoadingCourse, isLoadingProgress, courseId, router]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] gap-4 p-8 text-center bg-canvas-soft">
      <Loader2 className="w-8 h-8 animate-spin text-notion-blue" />
      <p className="text-sm font-medium text-ink-muted">
        Loading learning workspace...
      </p>
    </div>
  );
}
