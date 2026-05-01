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

export interface MarketItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
  created_at?: string;
}

export interface SavingGoal {
  id: string;
  market_id: string;
  goal_name: string;
  target_coin: number;
  current_coin: number;
}

const AUTH_TOKEN_KEY = "tomoAuthToken";
const CHILD_AUTH_TOKEN_KEY = "tomoChildAuthToken";
const AUTH_TOKEN_FALLBACK_KEYS = ["accessToken", "token"];
let pendingCoinsRequest: Promise<ApiResponse<number>> | null = null;
let coinsEndpointUnavailable = false;

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
  if (t) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, t);
    window.localStorage.setItem("accessToken", t);
  }
}

function storeParentProfileFromResponse(data: unknown) {
  if (typeof window === "undefined") return;
  if (!data || typeof data !== "object") return;
  const d = data as any;
  const src = d.user || d.data || d.profile || d.parent || d;

  const name =
    (src && (src.username || src.name || src.fullName || src.full_name)) || "";
  const email = (src && (src.email || "")) || "";
  const id = (src && (src.id || src._id || src.parentId)) || "";

  try {
    if (typeof name === "string" && name.trim()) {
      window.localStorage.setItem("tomoParentName", name.trim());
    }
    if (typeof email === "string" && email.trim()) {
      window.localStorage.setItem("tomoParentEmail", email.trim());
    }
    const profileObj = { id: id || null, name: name || null, email: email || null };
    window.localStorage.setItem("tomoParentProfile", JSON.stringify(profileObj));
  } catch {
    // ignore storage errors
  }
}

function storeChildTokenFromResponse(data: unknown) {
  if (typeof window === "undefined") return;
  const t = extractToken(data);
  if (t) {
    window.localStorage.setItem(CHILD_AUTH_TOKEN_KEY, t);
    window.localStorage.setItem("childAccessToken", t);
  }
}

function clearChildToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHILD_AUTH_TOKEN_KEY);
  window.localStorage.removeItem("childAccessToken");
}

function getStoredToken(extraKeys: string[] = []): string | null {
  if (typeof window === "undefined") return null;
  return (
    [AUTH_TOKEN_KEY, ...extraKeys, ...AUTH_TOKEN_FALLBACK_KEYS]
      .map((key) => window.localStorage.getItem(key))
      .find(Boolean) ||
    null
  );
}

function authHeaders(): Record<string, string> {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function childAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const t =
    window.localStorage.getItem(CHILD_AUTH_TOKEN_KEY) ||
    window.localStorage.getItem("childAccessToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function hasChildToken(): boolean {
  return Boolean(childAuthHeaders().Authorization);
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
  const normalized = message.toLowerCase();

  if (
    status === 400 &&
    (normalized.includes("pin") ||
      normalized.includes("password") ||
      normalized.includes("invalid") )
  ) {
    return message || "Invalid request data.";
  }

  if (status === 401) return "Unauthorized. Please login again.";
  if (status === 403) return "Access denied.";
  if (status === 404) return message || "Resource not found.";
  if (status >= 500) return "Server error. Please try again later.";

  return message || `HTTP ${status}`;
}

function getFriendlyNetworkError(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return "Network error";
  }
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
    if (res.success) {
      storeTokenFromResponse(res.data);
      storeParentProfileFromResponse(res.data);
    }
    return res;
  },

  login: async (email: string, password: string) => {
    const res = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (res.success) {
      storeTokenFromResponse(res.data);
      storeParentProfileFromResponse(res.data);
    }
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
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
      body: JSON.stringify(userData),
    });
  },
};

/**
 * Parent API calls
 */
export const parentApi = {
  getInfo: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PARENT.INFO, {
      method: "GET",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
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
    const res = await apiCall(API_CONFIG.ENDPOINTS.CHILDREN.LOGIN, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ childId, pin }),
    });
    if (res.success) {
      clearChildToken();
      storeChildTokenFromResponse(res.data);
    }
    return res;
  },

  updateName: async (name: string): Promise<ApiResponse<ChildProfile>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const res = await apiCall<{ message?: string; data?: ChildProfile }>(
      API_CONFIG.ENDPOINTS.CHILDREN.UPDATE_NAME,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (body?.data && typeof body.data === "object") {
      return { success: true, data: body.data as ChildProfile };
    }

    return { success: false, error: "Profile anak tidak valid." };
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

  getMarkets: async (): Promise<ApiResponse<MarketItem[]>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const res = await apiCall<{ message?: string; data?: MarketItem[] }>(
      API_CONFIG.ENDPOINTS.CHILDREN.MARKETS,
      {
        method: "GET",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (Array.isArray(body?.data)) {
      return { success: true, data: body.data as MarketItem[] };
    }

    if (Array.isArray(res.data)) {
      return { success: true, data: res.data as MarketItem[] };
    }

    return { success: true, data: [] };
  },

  getCoins: async (): Promise<ApiResponse<number>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    if (coinsEndpointUnavailable) {
      return {
        success: false,
        error: "Data koin anak belum tersedia.",
      };
    }

    if (pendingCoinsRequest) {
      return pendingCoinsRequest;
    }

    pendingCoinsRequest = (async () => {
      const res = await apiCall<{ message?: string; data?: { amount?: number } }>(
        API_CONFIG.ENDPOINTS.CHILDREN.COINS,
        {
          method: "GET",
          credentials: "include",
          headers: {
            ...childAuthHeaders(),
          },
        }
      );

      if (!res.success) {
        if (res.error?.includes("HTTP 404")) {
          coinsEndpointUnavailable = true;
        }

        return { success: false, error: res.error };
      }

      const body = res.data as { data?: { amount?: unknown } };
      if (typeof body?.data?.amount === "number") {
        return { success: true, data: body.data.amount };
      }

      return { success: true, data: 0 };
    })();

    const response = await pendingCoinsRequest;
    pendingCoinsRequest = null;
    return response;
  },

  setSavingGoal: async (marketId: string): Promise<ApiResponse<SavingGoal>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    // Some backends expect the marketId in the POST body instead of the path.
    const res = await apiCall<{ message?: string; data?: SavingGoal }>(
      API_CONFIG.ENDPOINTS.CHILDREN.SAVING_GOAL,
      {
        method: "POST",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
        body: JSON.stringify({ marketId }),
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (body?.data && typeof body.data === "object") {
      return { success: true, data: body.data as SavingGoal };
    }

    return { success: false, error: "Saving goal tidak valid." };
  },
};
