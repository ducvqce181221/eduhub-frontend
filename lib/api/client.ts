import type { ApiResponse, ApiErrorResponse } from "@/types/api";

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

let getAccessTokenFn: TokenGetter = () => null;
let setAccessTokenFn: TokenSetter = () => {};
let onUnauthorizedFn: UnauthorizedCallback = () => {};

export function setAuthTokenGetter(getter: TokenGetter) {
  getAccessTokenFn = getter;
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function performRefresh(): Promise<string | null> {
  try {
    const refreshUrl = `${BASE_URL.replace(/\/+$/, "")}/api/v1/auth/refresh`;
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      setAccessTokenFn(null);
      onUnauthorizedFn();
      return null;
    }

    const data = await res.json();
    const newAccessToken = data?.data?.accessToken || null;
    if (newAccessToken) {
      setAccessTokenFn(newAccessToken);
    }
    return newAccessToken;
  } catch {
    setAccessTokenFn(null);
    onUnauthorizedFn();
    return null;
  }
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

  const url = new URL(`${BASE_URL.replace(/\/+$/, "")}${urlPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const reqHeaders = new Headers(headers);

  const token = getAccessTokenFn();
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
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performRefresh();
      isRefreshing = false;
      onRefreshed(newToken);

      if (newToken) {
        return request<T>(endpoint, { ...options, _retry: true });
      }
    } else {
      // Queue requests while refresh is ongoing
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          if (!newToken) {
            reject(
              new ApiError({
                statusCode: 401,
                error: "Unauthorized",
                message: "Session expired. Please log in again.",
              }),
            );
            return;
          }
          try {
            const res = await request<T>(endpoint, { ...options, _retry: true });
            resolve(res);
          } catch (err) {
            reject(err);
          }
        });
      });
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


