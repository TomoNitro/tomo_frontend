/**
 * API Service
 * Centralized API calls with error handling
 */

import { API_CONFIG } from "./config";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  created_at?: string;
}

const AUTH_TOKEN_KEY = "tomoAuthToken";

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.accessToken === "string") return d.accessToken;
  if (typeof d.token === "string") return d.token;
  if (typeof d.jwt === "string") return d.jwt;
  if (d.Token && typeof d.Token === "object") {
    return extractToken(d.Token);
  }
  if (d.data && typeof d.data === "object") {
    return extractToken(d.data);
  }
  return null;
}

function storeTokenFromResponse(data: unknown) {
  if (typeof window === "undefined") return;
  const t = extractToken(data);
  if (t) window.localStorage.setItem(AUTH_TOKEN_KEY, t);
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function getFriendlyApiError(status: number, data: unknown): string {
  const message =
    data && typeof data === "object"
      ? String(
          (data as { error?: unknown; message?: unknown }).error ||
            (data as { error?: unknown; message?: unknown }).message ||
            ""
        )
      : "";
  const normalizedMessage = message.toLowerCase();

  if (
    status === 400 &&
    (normalizedMessage.includes("pin") ||
      normalizedMessage.includes("password") ||
      normalizedMessage.includes("record not found") ||
      normalizedMessage.includes("not found") ||
      normalizedMessage.includes("invalid") ||
      normalizedMessage.includes("code=400"))
  ) {
    return "Email, password, atau PIN belum sesuai. Silakan coba lagi.";
  }

  if (status === 401 || status === 403) {
    return "Email, password, atau PIN belum sesuai. Silakan coba lagi.";
  }

  if (status === 404 || normalizedMessage.includes("record not found")) {
    return "Data belum ditemukan. Silakan muat ulang atau pilih profil lagi.";
  }

  if (status === 409) {
    return "Data ini sudah digunakan. Silakan pakai yang lain.";
  }

  if (status === 422) {
    return "Data yang diisi belum sesuai. Silakan periksa kembali.";
  }

  if (status >= 500) {
    return "Server sedang bermasalah. Coba lagi sebentar lagi.";
  }

  if (
    message &&
    !message.match(/^http\s+\d+/i) &&
    !normalizedMessage.includes("code=") &&
    !normalizedMessage.includes("record not found")
  ) {
    return message;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}

function getFriendlyNetworkError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Koneksi bermasalah. Periksa internet lalu coba lagi.";
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}

/**
 * Generic fetch wrapper for API calls
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: getFriendlyApiError(response.status, data),
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: getFriendlyNetworkError(error),
    };
  }
}

/**
 * Authentication API calls
 */
export const authApi = {
  register: async (username: string, email: string, password: string) => {
    const res = await apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });
    if (res.success) storeTokenFromResponse(res.data);
    return res;
  },

  login: async (email: string, password: string) => {
    const res = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (res.success) storeTokenFromResponse(res.data);
    return res;
  },

  logout: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
  },
};

/**
 * User API calls
 */
export const userApi = {
  getProfile: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.USER.PROFILE, {
      method: "GET",
    });
  },

  updateProfile: async (userData: Record<string, unknown>) => {
    return apiCall(API_CONFIG.ENDPOINTS.USER.UPDATE, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
};

/**
 * Children API calls
 */
export const childrenApi = {
  register: async (username: string, pin: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.CHILDREN.REGISTER, {
      method: "POST",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
      // backend expects `name` field
      body: JSON.stringify({ name: username, pin }),
    });
  },

  login: async (childId: string, pin: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.CHILDREN.LOGIN, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ childId, pin }),
    });
  },

  getList: async (parentId?: string): Promise<ApiResponse<ChildProfile[]>> => {
    const params = parentId ? `?parentId=${parentId}` : "";
    const res = await apiCall<{ message?: string; data?: ChildProfile[] }>(
      `${API_CONFIG.ENDPOINTS.CHILDREN.GET_LIST}${params}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          ...authHeaders(),
        },
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (body && Array.isArray(body.data)) {
      return { success: true, data: body.data as ChildProfile[] };
    }

    // Fallback: if API already returned a raw array of child objects
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data as ChildProfile[] };
    }

    return { success: true, data: [] };
  },
};
