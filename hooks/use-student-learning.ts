"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCourseProgress,
  getLessonDetails,
  getLessonProgress,
  getQuizAttempts,
  getQuizDetails,
  submitQuizAttempt,
  updateLessonProgress,
} from "@/lib/api/student";
import type { SubmitQuizAnswerPayload } from "@/types/api";
import { toast } from "sonner";

export const STUDENT_QUERY_KEYS = {
  lesson: (lessonId: string) => ["student", "lesson", lessonId] as const,
  lessonProgress: (lessonId: string) => ["student", "progress", "lesson", lessonId] as const,
  courseProgress: (courseId: string) => ["student", "progress", "course", courseId] as const,
  quiz: (quizId: string) => ["student", "quiz", quizId] as const,
  quizAttempts: (quizId: string) => ["student", "quiz", quizId, "attempts"] as const,
};

export function useLessonDetailsQuery(lessonId: string) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.lesson(lessonId),
    queryFn: () => getLessonDetails(lessonId),
    enabled: !!lessonId,
  });
}

export function useCourseProgressQuery(courseId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.courseProgress(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: enabled && !!courseId,
    staleTime: 10 * 1000,
  });
}

export function useLessonProgressQuery(lessonId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.lessonProgress(lessonId),
    queryFn: () => getLessonProgress(lessonId),
    enabled: enabled && !!lessonId,
  });
}

export function useUpdateProgressMutation(courseId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, watchedSeconds }: { lessonId: string; watchedSeconds: number }) =>
      updateLessonProgress(lessonId, watchedSeconds),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(STUDENT_QUERY_KEYS.lessonProgress(variables.lessonId), data);
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.courseProgress(courseId) });
      }
      if (data.isCompleted) {
        queryClient.invalidateQueries({ queryKey: ["enrollments", "me"] });
      }
    },
    onError: (err: any) => {
      console.warn("Heartbeat progress sync notice:", err?.message);
    },
  });
}

export function useQuizDetailsQuery(quizId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.quiz(quizId),
    queryFn: () => getQuizDetails(quizId),
    enabled: enabled && !!quizId,
  });
}

export function useQuizAttemptsQuery(quizId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.quizAttempts(quizId),
    queryFn: () => getQuizAttempts(quizId),
    enabled: enabled && !!quizId,
  });
}

export function useSubmitQuizMutation(courseId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      answers,
    }: {
      quizId: string;
      answers: SubmitQuizAnswerPayload[];
    }) => submitQuizAttempt(quizId, answers),
    onSuccess: (data, variables) => {
      if (data.isPassed) {
        toast.success(`Quiz passed with score ${data.score}%!`);
      } else {
        toast.error(`Quiz score ${data.score}% is below required ${data.passScore}%. You can retry.`);
      }
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.quizAttempts(variables.quizId) });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.courseProgress(courseId) });
      }
      queryClient.invalidateQueries({ queryKey: ["enrollments", "me"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit quiz attempt");
    },
  });
}
