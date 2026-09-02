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
    <div className="flex flex-col flex-1 bg-canvas-soft min-h-[85vh] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[550px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
