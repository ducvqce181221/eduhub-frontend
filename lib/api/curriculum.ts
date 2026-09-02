import { apiClient } from "./client";
import type {
  Chapter,
  Lesson,
  LessonVideo,
  LessonResource,
  LessonQuiz,
  QuizQuestion,
  CreateChapterPayload,
  UpdateChapterPayload,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderPayload,
  UpsertVideoPayload,
  CreateResourcePayload,
  UpdateResourcePayload,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/api";

// Chapter CRUD
export async function createChapter(
  courseId: string,
  payload: CreateChapterPayload
): Promise<Chapter> {
  const response = await apiClient.post<Chapter>(`/courses/${courseId}/chapters`, payload);
  return response.data;
}

export async function updateChapter(
  chapterId: string,
  payload: UpdateChapterPayload
): Promise<Chapter> {
  const response = await apiClient.patch<Chapter>(`/chapters/${chapterId}`, payload);
  return response.data;
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await apiClient.delete(`/chapters/${chapterId}`);
}

export async function reorderChapters(
  courseId: string,
  payload: ReorderPayload
): Promise<void> {
  await apiClient.patch(`/courses/${courseId}/chapters/reorder`, payload);
}

// Lesson CRUD
export async function createLesson(
  chapterId: string,
  payload: CreateLessonPayload
): Promise<Lesson> {
  const response = await apiClient.post<Lesson>(`/chapters/${chapterId}/lessons`, payload);
  return response.data;
}

export async function updateLesson(
  lessonId: string,
  payload: UpdateLessonPayload
): Promise<Lesson> {
  const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}`, payload);
  return response.data;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  await apiClient.delete(`/lessons/${lessonId}`);
}

export async function reorderLessons(
  chapterId: string,
  payload: ReorderPayload
): Promise<void> {
  await apiClient.patch(`/chapters/${chapterId}/lessons/reorder`, payload);
}

// Lesson Video
export async function upsertLessonVideo(
  lessonId: string,
  payload: UpsertVideoPayload
): Promise<LessonVideo> {
  const response = await apiClient.put<LessonVideo>(`/lessons/${lessonId}/video`, payload);
  return response.data;
}

// Lesson Resources
export async function createLessonResource(
  lessonId: string,
  payload: CreateResourcePayload
): Promise<LessonResource> {
  const response = await apiClient.post<LessonResource>(`/lessons/${lessonId}/resources`, payload);
  return response.data;
}

export async function updateLessonResource(
  resourceId: string,
  payload: UpdateResourcePayload
): Promise<LessonResource> {
  const response = await apiClient.patch<LessonResource>(`/resources/${resourceId}`, payload);
  return response.data;
}

export async function deleteLessonResource(resourceId: string): Promise<void> {
  await apiClient.delete(`/resources/${resourceId}`);
}

// Lesson Quiz & Questions
export async function createLessonQuiz(
  lessonId: string,
  payload: CreateQuizPayload
): Promise<LessonQuiz> {
  const response = await apiClient.post<LessonQuiz>(`/lessons/${lessonId}/quiz`, payload);
  return response.data;
}

export async function updateLessonQuiz(
  quizId: string,
  payload: UpdateQuizPayload
): Promise<LessonQuiz> {
  const response = await apiClient.patch<LessonQuiz>(`/quizzes/${quizId}`, payload);
  return response.data;
}

export async function deleteLessonQuiz(quizId: string): Promise<void> {
  await apiClient.delete(`/quizzes/${quizId}`);
}

export async function createQuizQuestion(
  quizId: string,
  payload: CreateQuestionPayload
): Promise<QuizQuestion> {
  const response = await apiClient.post<QuizQuestion>(`/quizzes/${quizId}/questions`, payload);
  return response.data;
}

export async function updateQuizQuestion(
  questionId: string,
  payload: UpdateQuestionPayload
): Promise<QuizQuestion> {
  const response = await apiClient.patch<QuizQuestion>(`/questions/${questionId}`, payload);
  return response.data;
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/questions/${questionId}`);
}
