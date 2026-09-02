"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollCourse,
  getCategories,
  getCourseById,
  getCourses,
  getMyEnrollments,
} from "@/lib/api/courses";
import type { QueryCoursesParams } from "@/types/api";
import { toast } from "sonner";

export const COURSE_QUERY_KEYS = {
  all: ["courses"] as const,
  list: (params: QueryCoursesParams) => ["courses", "list", params] as const,
  detail: (id: string) => ["courses", "detail", id] as const,
  categories: ["categories"] as const,
  myEnrollments: ["enrollments", "me"] as const,
};

export function useCoursesQuery(params: QueryCoursesParams) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(params),
    queryFn: () => getCourses(params),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.categories,
    queryFn: () => getCategories(true),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourseDetailQuery(id: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(id),
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });
}

export function useMyEnrollmentsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.myEnrollments,
    queryFn: () => getMyEnrollments(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollCourse(courseId),
    onSuccess: (data, courseId) => {
      toast.success("Successfully enrolled in the course!");
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.myEnrollments });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to enroll in course";
      toast.error(message);
    },
  });
}
