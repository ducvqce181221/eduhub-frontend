import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient, setAuthTokenGetter, setOnUnauthorizedCallback, ApiError } from "@/lib/api/client";

describe("Slice 2: Frontend API Client & Envelope Unwrapper & Silent Refresh", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    setAuthTokenGetter(() => null);
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
});
