import { apiClient, normalizePaginatedResponse } from "./client";
import type {
  Category,
  Course,
  CoursesListResponse,
  Enrollment,
  QueryCoursesParams,
} from "@/types/api";

export async function getCourses(
  params: QueryCoursesParams = {},
): Promise<CoursesListResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    level: params.level,
    search: params.search,
  };

  const response = await apiClient.get<CoursesListResponse | Course[]>("/courses", {
    params: queryParams,
    skipAuth: true,
  });

  return normalizePaginatedResponse<Course>(response, params);
}

export async function archiveCourse(id: string): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}/archive`);
  return response.data;
}

export async function getCategories(onlyActive: boolean = true): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories", {
    params: { onlyActive: String(onlyActive) },
    skipAuth: true,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCourseById(id: string): Promise<Course> {
  const response = await apiClient.get<Course>(`/courses/${id}`);
  return response.data;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await apiClient.get<Enrollment[]>("/me/enrollments");
  return Array.isArray(response.data) ? response.data : [];
}

export async function enrollCourse(courseId: string): Promise<Enrollment> {
  const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enroll`);
  return response.data;
}

export interface CoursePreviewVideo {
  courseId: string;
  courseTitle?: string;
  courseSlug?: string;
  lessonId: string;
  lessonTitle: string;
  durationSeconds?: number;
  previewUrl: string;
  videoUrl?: string;
  isPreview?: boolean;
}

export async function getCoursePreviewVideo(courseId: string): Promise<CoursePreviewVideo | null> {
  const response = await apiClient.get<any>(`/courses/${courseId}/preview-video`, {
    skipAuth: true,
  });
  if (!response.data) return null;
  const data = response.data;
  const url = data.previewUrl || data.videoUrl || "";
  return {
    ...data,
    previewUrl: url,
    videoUrl: url,
  };
}

