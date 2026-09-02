import { apiClient } from "./client";
import type {
  Category,
  Course,
  CoursesListResponse,
  Enrollment,
  PaginationMeta,
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

  // Normalize response data whether backend wrapped items in data.items or data directly
  const data = response.data as any;
  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      meta: data.meta ||
        response.meta || {
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
          total: data.items.length,
          totalPages: Math.ceil(data.items.length / (Number(params.limit) || 10)),
        },
    };
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: response.meta || {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
        total: data.length,
        totalPages: Math.ceil(data.length / (Number(params.limit) || 10)),
      },
    };
  }

  return {
    items: [],
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  };
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
