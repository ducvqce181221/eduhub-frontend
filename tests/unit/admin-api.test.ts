import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, ApiError } from "@/lib/api/client";
import {
  getUsers,
  getUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCourses,
  archiveCourse,
  sendSystemNotification,
} from "@/lib/api/admin";

describe("Admin API Client (lib/api/admin.ts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("User Management APIs", () => {
    it("getUsers calls GET /users with query parameters and parses pagination envelope", async () => {
      const mockUsers = [
        { id: "u-1", email: "student@test.com", fullName: "Alice", role: "STUDENT" as const, isActive: true },
        { id: "u-2", email: "teacher@test.com", fullName: "Bob", role: "TEACHER" as const, isActive: true },
      ];
      const mockMeta = { page: 1, limit: 10, total: 2, totalPages: 1 };

      vi.spyOn(apiClient, "get").mockResolvedValue({
        success: true,
        data: mockUsers,
        meta: mockMeta,
      });

      const result = await getUsers({ page: 1, limit: 10, search: "alice", role: "STUDENT" });
      expect(apiClient.get).toHaveBeenCalledWith("/users", {
        params: { page: 1, limit: 10, search: "alice", role: "STUDENT", isActive: undefined },
      });
      expect(result.users).toEqual(mockUsers);
      expect(result.meta).toEqual(mockMeta);
    });

    it("getUserById calls GET /users/:id", async () => {
      const mockUser = { id: "u-1", email: "user@test.com", fullName: "Alice", role: "STUDENT" as const, isActive: true };
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockUser });

      const result = await getUserById("u-1");
      expect(apiClient.get).toHaveBeenCalledWith("/users/u-1");
      expect(result).toEqual(mockUser);
    });

    it("createUser calls POST /users with creation payload", async () => {
      const payload = {
        email: "newteacher@eduhub.dev",
        password: "Password123!",
        fullName: "Jane Doe",
        role: "TEACHER" as const,
      };
      const mockCreated = { id: "u-new", ...payload, isActive: true };
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: mockCreated });

      const result = await createUser(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/users", payload);
      expect(result).toEqual(mockCreated);
    });

    it("updateUserRole calls PATCH /users/:id/role with role payload", async () => {
      const mockUpdated = { id: "u-1", email: "alice@test.com", fullName: "Alice", role: "TEACHER" as const, isActive: true };
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: mockUpdated });

      const result = await updateUserRole("u-1", "TEACHER");
      expect(apiClient.patch).toHaveBeenCalledWith("/users/u-1/role", { role: "TEACHER" });
      expect(result).toEqual(mockUpdated);
    });

    it("updateUserStatus calls PATCH /users/:id/status with isActive payload", async () => {
      const mockUpdated = { id: "u-1", email: "alice@test.com", fullName: "Alice", role: "STUDENT" as const, isActive: false };
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: mockUpdated });

      const result = await updateUserStatus("u-1", false);
      expect(apiClient.patch).toHaveBeenCalledWith("/users/u-1/status", { isActive: false });
      expect(result).toEqual(mockUpdated);
    });

    it("handles 400 Bad Request when admin tries to deactivate own account", async () => {
      vi.spyOn(apiClient, "patch").mockRejectedValue(
        new ApiError({
          statusCode: 400,
          error: "Bad Request",
          message: "Cannot deactivate your own account",
        }),
      );

      await expect(updateUserStatus("current-admin-id", false)).rejects.toThrow(
        "Cannot deactivate your own account",
      );
    });
  });

  describe("Category Management APIs", () => {
    it("getCategories calls GET /categories with onlyActive=false", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Web Dev", slug: "web-dev", isActive: true },
        { id: "cat-2", name: "Legacy Dev", slug: "legacy-dev", isActive: false },
      ];
      vi.spyOn(apiClient, "get").mockResolvedValue({ success: true, data: mockCategories });

      const result = await getCategories(false);
      expect(apiClient.get).toHaveBeenCalledWith("/categories", {
        params: { onlyActive: false },
      });
      expect(result).toEqual(mockCategories);
    });

    it("createCategory calls POST /categories with payload", async () => {
      const payload = { name: "Cloud Computing", slug: "cloud-computing", description: "Cloud topics", isActive: true };
      const mockCategory = { id: "cat-cloud", ...payload };
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: mockCategory });

      const result = await createCategory(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/categories", payload);
      expect(result).toEqual(mockCategory);
    });

    it("updateCategory calls PATCH /categories/:id with payload", async () => {
      const payload = { name: "Cloud Computing Updated", isActive: false };
      const mockCategory = { id: "cat-cloud", slug: "cloud-computing", ...payload };
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: mockCategory });

      const result = await updateCategory("cat-cloud", payload);
      expect(apiClient.patch).toHaveBeenCalledWith("/categories/cat-cloud", payload);
      expect(result).toEqual(mockCategory);
    });

    it("deleteCategory calls DELETE /categories/:id", async () => {
      vi.spyOn(apiClient, "delete").mockResolvedValue({ success: true, data: undefined });

      await deleteCategory("cat-1");
      expect(apiClient.delete).toHaveBeenCalledWith("/categories/cat-1");
    });

    it("handles 409 Conflict when deleting category with active courses attached (BR-CAT-02)", async () => {
      vi.spyOn(apiClient, "delete").mockRejectedValue(
        new ApiError({
          statusCode: 409,
          error: "Conflict",
          message: "Category has active courses attached",
        }),
      );

      await expect(deleteCategory("cat-with-courses")).rejects.toThrow(
        "Category has active courses attached",
      );
    });
  });

  describe("Course Oversight & System Notifications APIs", () => {
    it("getAllCourses calls GET /courses and formats pagination", async () => {
      const mockCourses = [
        { id: "c-1", title: "Fullstack Next.js", status: "PUBLISHED" },
      ];
      vi.spyOn(apiClient, "get").mockResolvedValue({
        success: true,
        data: {
          items: mockCourses,
          meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
      });

      const result = await getAllCourses({ page: 1, search: "next" });
      expect(apiClient.get).toHaveBeenCalledWith("/courses", {
        params: { page: 1, limit: undefined, categoryId: undefined, level: undefined, search: "next" },
      });
      expect(result.items).toEqual(mockCourses);
    });

    it("archiveCourse calls PATCH /courses/:id/archive", async () => {
      const mockArchived = { id: "c-1", title: "Course 1", status: "ARCHIVED" };
      vi.spyOn(apiClient, "patch").mockResolvedValue({ success: true, data: mockArchived });

      const result = await archiveCourse("c-1");
      expect(apiClient.patch).toHaveBeenCalledWith("/courses/c-1/archive");
      expect(result).toEqual(mockArchived);
    });

    it("sendSystemNotification calls POST /notifications/system", async () => {
      const payload = {
        title: "Scheduled Maintenance",
        message: "Platform upgrade tonight at 2 AM UTC.",
      };
      const mockRes = { success: true, message: "System notification broadcasted successfully", recipientCount: 150 };
      vi.spyOn(apiClient, "post").mockResolvedValue({ success: true, data: mockRes });

      const result = await sendSystemNotification(payload);
      expect(apiClient.post).toHaveBeenCalledWith("/notifications/system", payload);
      expect(result).toEqual(mockRes);
    });
  });
});
