import { apiClient } from "./client";
import type {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
  EnrolledStudentProgressItem,
  CourseAggregateProgress,
  CourseQuizResultItem,
} from "@/types/api";

export async function getMyCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>("/me/courses");
  return Array.isArray(response.data) ? response.data : [];
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await apiClient.post<Course>("/courses", payload);
  return response.data;
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}`, payload);
  return response.data;
}

export async function publishCourse(id: string): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}/publish`);
  return response.data;
}

export async function unpublishCourse(id: string): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}/unpublish`);
  return response.data;
}

export async function archiveCourse(id: string): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}/archive`);
  return response.data;
}

export async function getCourseStudents(courseId: string): Promise<EnrolledStudentProgressItem[]> {
  const response = await apiClient.get<EnrolledStudentProgressItem[]>(`/courses/${courseId}/students`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCourseProgressMetrics(courseId: string): Promise<CourseAggregateProgress> {
  const response = await apiClient.get<CourseAggregateProgress>(`/courses/${courseId}/progress`);
  return response.data;
}

export async function getCourseQuizResults(courseId: string): Promise<CourseQuizResultItem[]> {
  const response = await apiClient.get<CourseQuizResultItem[]>(`/courses/${courseId}/quiz-results`);
  return Array.isArray(response.data) ? response.data : [];
}
