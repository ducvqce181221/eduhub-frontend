import type { ApiResponse, ApiErrorResponse, PaginationMeta } from "@/types/api";

export class ApiError extends Error {
  statusCode: number;
  error: string;
  messages: string[];
  path?: string;

  constructor(payload: {
    statusCode: number;
    error: string;
    message: string | string[];
    path?: string;
  }) {
    const formattedMessage = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message || "An unexpected error occurred";
    super(formattedMessage);
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.error = payload.error || "Error";
    this.messages = Array.isArray(payload.message) ? payload.message : [payload.message];
    this.path = payload.path;
  }
}

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;
type UnauthorizedCallback = () => void;

let memoryAccessToken: string | null = null;
let customTokenGetter: TokenGetter | null = null;
let setAccessTokenFn: TokenSetter = () => {};
let onUnauthorizedFn: UnauthorizedCallback = () => {};

export function getAccessToken(): string | null {
  if (customTokenGetter) {
    return customTokenGetter();
  }
  return memoryAccessToken;
}

export function setAccessToken(token: string | null): void {
  memoryAccessToken = token;
  if (setAccessTokenFn) {
    try {
      setAccessTokenFn(token);
    } catch {
      // ignore
    }
  }
}

export function setAuthTokenGetter(getter: TokenGetter | null) {
  customTokenGetter = getter;
}

export function setAuthTokenSetter(setter: TokenSetter) {
  setAccessTokenFn = setter;
}

export function setOnUnauthorizedCallback(callback: UnauthorizedCallback) {
  onUnauthorizedFn = callback;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  _retry?: boolean;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return "";
  }
  return (process.env.BACKEND_INTERNAL_URL || "http://localhost:5000").replace(/\/+$/, "");
}

let refreshPromise: Promise<string | null> | null = null;

export async function performTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = getBaseUrl();
      const refreshUrl = baseUrl ? `${baseUrl}/api/v1/auth/refresh` : `/api/v1/auth/refresh`;
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        setAccessToken(null);
        onUnauthorizedFn();
        return null;
      }

      const data = await res.json();
      const newAccessToken = data?.data?.accessToken || null;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
      } else {
        setAccessToken(null);
        onUnauthorizedFn();
      }
      return newAccessToken;
    } catch {
      setAccessToken(null);
      onUnauthorizedFn();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, params, headers = {}, skipAuth = false, _retry = false, ...customConfig } = options;

  let urlPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!urlPath.startsWith("/api/v1")) {
    urlPath = `/api/v1${urlPath}`;
  }

  // Handle /auth/refresh endpoint requests to share the same refresh promise
  if (endpoint.includes("/auth/refresh") && !_retry) {
    const newToken = await performTokenRefresh();
    if (!newToken) {
      throw new ApiError({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or expired refresh token",
      });
    }
    return {
      success: true,
      data: { accessToken: newToken } as unknown as T,
    };
  }

  let token = getAccessToken();

  // If this request requires auth, has no token, but a refresh is in flight (or user has session cookie),
  // wait for refresh so we can send the request with Authorization header directly and avoid an unnecessary 401.
  if (!token && !skipAuth && !endpoint.includes("/auth/")) {
    if (refreshPromise) {
      token = await refreshPromise;
    } else if (
      !_retry &&
      typeof document !== "undefined" &&
      document.cookie.includes("eduhub_user=")
    ) {
      token = await performTokenRefresh();
    }
  }

  const baseUrl = getBaseUrl();
  const fullPath = baseUrl ? `${baseUrl}${urlPath}` : urlPath;
  const url = typeof window !== "undefined"
    ? new URL(fullPath, window.location.origin)
    : new URL(fullPath, "http://localhost:5000");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const reqHeaders = new Headers(headers);

  if (!reqHeaders.has("Accept-Language") && typeof document !== "undefined") {
    const match = document.cookie.match(/eduhub_lang=([^;]+)/);
    if (match) {
      reqHeaders.set("Accept-Language", match[1]);
    }
  }

  if (token && !skipAuth && !reqHeaders.has("Authorization")) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    reqHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
    credentials: "include",
    body: requestBody,
  };

  const response = await fetch(url.toString(), config);

  // Handle 401 Silent Refresh
  if (response.status === 401 && !_retry && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login")) {
    const newToken = await performTokenRefresh();
    if (newToken) {
      return request<T>(endpoint, { ...options, _retry: true });
    }
  }

  // Parse JSON response
  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorPayload: ApiErrorResponse = data || {
      success: false,
      statusCode: response.status,
      error: response.statusText,
      message: response.statusText || "Request failed",
    };
    if (response.status === 401) {
      onUnauthorizedFn();
    }
    throw new ApiError(errorPayload);
  }

  return data as ApiResponse<T>;
}

function normalizeOptions(
  bodyOrOptions?: unknown,
  customOptions?: RequestOptions,
): RequestOptions {
  if (bodyOrOptions === undefined) {
    return customOptions || {};
  }

  if (
    bodyOrOptions &&
    typeof bodyOrOptions === "object" &&
    !(bodyOrOptions instanceof FormData) &&
    ("body" in bodyOrOptions || "skipAuth" in bodyOrOptions || "params" in bodyOrOptions)
  ) {
    return {
      ...(bodyOrOptions as RequestOptions),
      ...customOptions,
    };
  }

  return {
    ...customOptions,
    body: bodyOrOptions,
  };
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T = unknown>(endpoint: string, bodyOrOptions?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...normalizeOptions(bodyOrOptions, options),
      method: "POST",
    }),
  patch: <T = unknown>(endpoint: string, bodyOrOptions?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...normalizeOptions(bodyOrOptions, options),
      method: "PATCH",
    }),
  put: <T = unknown>(endpoint: string, bodyOrOptions?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...normalizeOptions(bodyOrOptions, options),
      method: "PUT",
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPositiveNumber(val: unknown, fallback: number): number {
  const num = Number(val);
  return !Number.isNaN(num) && num > 0 ? num : fallback;
}

function toNonNegativeNumber(val: unknown, fallback: number): number {
  const num = Number(val);
  return !Number.isNaN(num) && num >= 0 ? num : fallback;
}

/**
 * Type-safe normalizer for paginated API responses.
 * Avoids 'any' while safely handling diverse backend response conventions
 * (e.g. data.items, direct array, custom or standard envelope meta).
 */
export function normalizePaginatedResponse<T>(
  response: ApiResponse<unknown>,
  fallbackParams?: { page?: number | string; limit?: number | string },
): PaginatedResult<T> {
  const defaultPage = Math.max(1, Number(fallbackParams?.page) || 1);
  const defaultLimit = Math.max(1, Number(fallbackParams?.limit) || 10);
  const fallbackMeta = response.meta;

  const data = response.data;

  // Case 1: data has { items: T[], meta?: PaginationMeta }
  if (isRecord(data) && "items" in data && Array.isArray(data.items)) {
    const items = data.items as T[];
    const metaObj = isRecord(data.meta) ? (data.meta as Partial<PaginationMeta>) : undefined;

    const page = toPositiveNumber(metaObj?.page ?? fallbackMeta?.page, defaultPage);
    const limit = toPositiveNumber(metaObj?.limit ?? fallbackMeta?.limit, defaultLimit);
    const total = toNonNegativeNumber(metaObj?.total ?? fallbackMeta?.total, items.length);
    const totalPages = toPositiveNumber(
      metaObj?.totalPages ?? fallbackMeta?.totalPages,
      Math.ceil(total / limit) || 1,
    );

    return {
      items,
      meta: { page, limit, total, totalPages },
    };
  }

  // Case 2: data is directly T[]
  if (Array.isArray(data)) {
    const items = data as T[];
    const page = toPositiveNumber(fallbackMeta?.page, defaultPage);
    const limit = toPositiveNumber(fallbackMeta?.limit, defaultLimit);
    const total = toNonNegativeNumber(fallbackMeta?.total, items.length);
    const totalPages = toPositiveNumber(fallbackMeta?.totalPages, Math.ceil(total / limit) || 1);

    return {
      items,
      meta: { page, limit, total, totalPages },
    };
  }

  // Case 3: Empty / unexpected shape
  return {
    items: [],
    meta: {
      page: defaultPage,
      limit: defaultLimit,
      total: 0,
      totalPages: 0,
    },
  };
}


