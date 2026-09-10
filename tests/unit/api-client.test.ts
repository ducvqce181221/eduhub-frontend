import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiClient,
  setAccessToken,
  setAuthTokenGetter,
  setOnUnauthorizedCallback,
  performTokenRefresh,
  ApiError,
  normalizePaginatedResponse,
} from "@/lib/api/client";

describe("Slice 2: Frontend API Client & Envelope Unwrapper & Silent Refresh", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    setAccessToken(null);
    setAuthTokenGetter(null);
    setOnUnauthorizedCallback(() => { });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("should successfully unwrap data from standard success envelope", async () => {
    const mockData = { id: "user-123", email: "student@eduhub.dev", fullName: "Student Name" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockData,
      }),
    } as Response);

    const result = await apiClient.get<typeof mockData>("/auth/me");
    expect(result.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/auth/me"),
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        headers: expect.any(Headers),
      }),
    );
  });

  it("should inject Bearer token into Authorization header when token getter returns token", async () => {
    setAuthTokenGetter(() => "test-access-token");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { ok: true },
      }),
    } as Response);

    await apiClient.get("/auth/me");

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const headers = fetchCall[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-access-token");
  });

  it("should throw ApiError with formatted details when response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        statusCode: 400,
        message: ["Email is required", "Password is required"],
        error: "Bad Request",
      }),
    } as Response);

    await expect(apiClient.post("/auth/login", { body: {} })).rejects.toThrow(ApiError);
  });

  it("should silently refresh token on 401 and retry original request", async () => {
    let currentToken = "expired-token";
    setAuthTokenGetter(() => currentToken);

    let refreshCalled = false;
    let retryCalled = false;

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        refreshCalled = true;
        currentToken = "new-valid-token";
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { accessToken: "new-valid-token" },
          }),
        };
      }

      if (url.includes("/auth/me")) {
        if (!refreshCalled) {
          return {
            ok: false,
            status: 401,
            json: async () => ({
              success: false,
              statusCode: 401,
              message: "Unauthorized",
              error: "Unauthorized",
            }),
          };
        }
        retryCalled = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { id: "user-123", email: "student@eduhub.dev" },
          }),
        };
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ success: false }),
      };
    });

    const result = await apiClient.get<{ id: string; email: string }>("/auth/me");
    expect(refreshCalled).toBe(true);
    expect(retryCalled).toBe(true);
    expect(result.data.id).toBe("user-123");
  });

  it("should trigger onUnauthorized callback when refresh also fails with 401", async () => {
    setAuthTokenGetter(() => "expired-token");
    const onUnauthorizedMock = vi.fn();
    setOnUnauthorizedCallback(onUnauthorizedMock);

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            success: false,
            statusCode: 401,
            message: "Invalid refresh token",
          }),
        };
      }

      return {
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          statusCode: 401,
          message: "Unauthorized",
        }),
      };
    });

    await expect(apiClient.get("/auth/me")).rejects.toThrow(ApiError);
    expect(onUnauthorizedMock).toHaveBeenCalled();
  });

  it("should deduplicate concurrent refresh requests into a single network call", async () => {
    let refreshCallCount = 0;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        refreshCallCount++;
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { accessToken: "shared-refreshed-token" },
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ success: false }) };
    });

    const [res1, res2, res3] = await Promise.all([
      performTokenRefresh(),
      performTokenRefresh(),
      apiClient.post("/auth/refresh"),
    ]);

    expect(refreshCallCount).toBe(1);
    expect(res1).toBe("shared-refreshed-token");
    expect(res2).toBe("shared-refreshed-token");
    expect((res3 as any).data.accessToken).toBe("shared-refreshed-token");
  });

  it("should wait for pending refresh before dispatching protected request with token", async () => {
    let refreshCompleted = false;
    let authHeaderSent: string | null = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, config?: RequestInit) => {
      if (url.includes("/auth/refresh")) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        refreshCompleted = true;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { accessToken: "preflight-token-123" },
          }),
        };
      }

      if (url.includes("/notifications")) {
        const headers = config?.headers as Headers;
        authHeaderSent = headers?.get("Authorization");
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [{ id: "n1", title: "Test" }],
          }),
        };
      }

      return { ok: false, status: 404, json: async () => ({ success: false }) };
    });

    // Start a refresh in the background
    const refreshTask = performTokenRefresh();

    // Concurrently, an authenticated request is initiated while token is not yet ready
    const notificationTask = apiClient.get("/notifications?limit=30");

    const [token, notifResult] = await Promise.all([refreshTask, notificationTask]);

    expect(token).toBe("preflight-token-123");
    expect(authHeaderSent).toBe("Bearer preflight-token-123");
    expect(refreshCompleted).toBe(true);
    expect((notifResult.data as any)[0].id).toBe("n1");
  });

  describe("Type-safe normalizePaginatedResponse helper", () => {
    it("should normalize response when data wraps items and meta", () => {
      const apiResponse = {
        success: true,
        data: {
          items: [{ id: "1", title: "Course 1" }, { id: "2", title: "Course 2" }],
          meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
        },
      };

      const result = normalizePaginatedResponse<{ id: string; title: string }>(apiResponse);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe("Course 1");
      expect(result.meta).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
    });

    it("should normalize response when data is a direct array and uses outer meta", () => {
      const apiResponse = {
        success: true,
        data: [{ id: "u1", name: "User 1" }],
        meta: { page: 2, limit: 5, total: 11, totalPages: 3 },
      };

      const result = normalizePaginatedResponse<{ id: string; name: string }>(apiResponse);
      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({ page: 2, limit: 5, total: 11, totalPages: 3 });
    });

    it("should compute sensible meta fallback when meta is missing", () => {
      const apiResponse = {
        success: true,
        data: [{ id: "1" }, { id: "2" }, { id: "3" }],
      };

      const result = normalizePaginatedResponse<{ id: string }>(apiResponse, { page: 1, limit: 2 });
      expect(result.items).toHaveLength(3);
      expect(result.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
    });

    it("should safely handle null/unexpected data payload without throwing", () => {
      const apiResponse = {
        success: true,
        data: null,
      };

      const result = normalizePaginatedResponse(apiResponse, { page: 3, limit: 10 });
      expect(result.items).toEqual([]);
      expect(result.meta).toEqual({ page: 3, limit: 10, total: 0, totalPages: 0 });
    });
  });
});
