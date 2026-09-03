import { apiClient } from "./client";
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
} from "@/types/api";

// -------------------------------------------------------------
// 1. User Management APIs
// -------------------------------------------------------------

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

  const users = Array.isArray(response.data) ? response.data : [];
  const meta = response.meta || {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
    total: users.length,
    totalPages: Math.ceil(users.length / (Number(params.limit) || 10)) || 1,
  };

  return { users, meta };
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
  };

  const response = await apiClient.get<CoursesListResponse | Course[]>("/courses", {
    params: queryParams,
  });

  const data = response.data as any;
  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      meta:
        data.meta ||
        response.meta || {
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 10,
          total: data.items.length,
          totalPages: Math.ceil(data.items.length / (Number(params.limit) || 10)) || 1,
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
        totalPages: Math.ceil(data.length / (Number(params.limit) || 10)) || 1,
      },
    };
  }

  return {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  };
}

export async function archiveCourse(id: string): Promise<Course> {
  const response = await apiClient.patch<Course>(`/courses/${id}/archive`);
  return response.data;
}

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
