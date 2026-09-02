import { apiClient } from "./client";
import type {
  CourseProgressResponse,
  Lesson,
  LessonProgressResponse,
  QuizAttemptResult,
  QuizAttemptSummary,
  QuizDetail,
  SubmitQuizAnswerPayload,
} from "@/types/api";

export async function getLessonDetails(lessonId: string): Promise<Lesson> {
  const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
  return response.data;
}

export async function getLessonProgress(
  lessonId: string,
): Promise<LessonProgressResponse> {
  const response = await apiClient.get<LessonProgressResponse>(
    `/lessons/${lessonId}/progress`,
  );
  return response.data;
}

export async function updateLessonProgress(
  lessonId: string,
  watchedSeconds: number,
): Promise<LessonProgressResponse> {
  const response = await apiClient.put<LessonProgressResponse>(
    `/lessons/${lessonId}/progress`,
    {
      body: { watchedSeconds },
    },
  );
  return response.data;
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgressResponse> {
  const response = await apiClient.get<CourseProgressResponse>(
    `/me/progress/courses/${courseId}`,
  );
  return response.data;
}

export async function getQuizDetails(quizId: string): Promise<QuizDetail> {
  const response = await apiClient.get<QuizDetail>(`/quizzes/${quizId}`);
  return response.data;
}

export async function submitQuizAttempt(
  quizId: string,
  answers: SubmitQuizAnswerPayload[],
): Promise<QuizAttemptResult> {
  const response = await apiClient.post<QuizAttemptResult>(
    `/quizzes/${quizId}/attempts`,
    {
      body: { answers },
    },
  );
  return response.data;
}

export async function getQuizAttempts(
  quizId: string,
): Promise<QuizAttemptSummary[]> {
  const response = await apiClient.get<QuizAttemptSummary[]>(
    `/quizzes/${quizId}/attempts`,
  );
  return Array.isArray(response.data) ? response.data : [];
}
