import { apiClient, normalizePaginatedResponse } from "./client";
import { archiveCourse } from "./courses";
import type {
  User,
  Category,
  Course,
  CoursesListResponse,
  PaginationMeta,
  Role,
  QueryUsersParams,
  CreateUserPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  SendSystemNotificationPayload,
  SystemNotificationResponse,
  QueryCoursesParams,
  UserStats,
  CourseStats,
} from "@/types/api";

// -------------------------------------------------------------
// 1. User Management APIs
// -------------------------------------------------------------

export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>("/users/stats");
  return response.data;
}

export async function getUsers(
  params: QueryUsersParams = {},
): Promise<{ users: User[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search,
    role: params.role,
    isActive: params.isActive,
  };

  const response = await apiClient.get<User[]>("/users", {
    params: queryParams,
  });

  const normalized = normalizePaginatedResponse<User>(response, params);
  return { users: normalized.items, meta: normalized.meta };
}

export async function getUserById(id: string): Promise<User> {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await apiClient.post<User>("/users", payload);
  return response.data;
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
  return response.data;
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}/status`, { isActive });
  return response.data;
}

// -------------------------------------------------------------
// 2. Category Management APIs
// -------------------------------------------------------------

export async function getCategories(onlyActive = false): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories", {
    params: { onlyActive },
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const response = await apiClient.post<Category>("/categories", payload);
  return response.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const response = await apiClient.patch<Category>(`/categories/${id}`, payload);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete<void>(`/categories/${id}`);
}

// -------------------------------------------------------------
// 3. Course Oversight APIs
// -------------------------------------------------------------

export async function getAllCourses(
  params: QueryCoursesParams = {},
): Promise<CoursesListResponse> {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    level: params.level,
    search: params.search,
    status: params.status,
  };

  const response = await apiClient.get<CoursesListResponse | Course[]>("/courses", {
    params: queryParams,
  });

  return normalizePaginatedResponse<Course>(response, params);
}

export async function getCourseStats(): Promise<CourseStats> {
  const response = await apiClient.get<CourseStats>("/courses/stats");
  return response.data;
}

export { archiveCourse };

// -------------------------------------------------------------
// 4. System Notification Broadcast APIs
// -------------------------------------------------------------

export async function sendSystemNotification(
  payload: SendSystemNotificationPayload,
): Promise<SystemNotificationResponse> {
  const response = await apiClient.post<SystemNotificationResponse>(
    "/notifications/system",
    payload,
  );
  return response.data;
}
