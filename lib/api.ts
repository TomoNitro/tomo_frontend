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

export interface ThemeTopic {
  topic: string;
}

export interface StoryThemes {
  finance: ThemeTopic[];
  story: ThemeTopic[];
}

const AUTH_TOKEN_KEY = "tomoAuthToken";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function extractToken(data: unknown): string | null {
  if (!isRecord(data)) return null;
  const d = data;
  if (typeof d.accessToken === "string") return d.accessToken;
  if (typeof d.token === "string") return d.token;
  if (typeof d.jwt === "string") return d.jwt;
  if (isRecord(d.Token)) {
    return extractToken(d.Token);
  }
  if (isRecord(d.data)) {
    return extractToken(d.data);
  }
  return null;
}

function storeTokenFromResponse(data: unknown) {
  if (typeof window === "undefined") return;
  const t = extractToken(data);
  if (t) window.localStorage.setItem(AUTH_TOKEN_KEY, t);
}

function storeParentProfileFromResponse(data: unknown) {
  if (typeof window === "undefined" || !isRecord(data)) return;

  const source = isRecord(data.user) ? data.user : isRecord(data.data) ? data.data : data;

  const name = source.username ?? source.name ?? source.fullName;
  const email = source.email;

  if (typeof name === "string" && name.trim()) {
    window.localStorage.setItem("tomoParentName", name.trim());
  }

  if (typeof email === "string" && email.trim()) {
    window.localStorage.setItem("tomoParentEmail", email.trim());
  }

  if ((typeof name === "string" && name.trim()) || (typeof email === "string" && email.trim())) {
    window.localStorage.setItem(
      "tomoParentProfile",
      JSON.stringify({
        name: typeof name === "string" ? name.trim() : "",
        email: typeof email === "string" ? email.trim() : "",
      })
    );
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
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
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
 * Story theme API calls
 */
export const themeApi = {
  getAll: async (): Promise<ApiResponse<StoryThemes>> => {
    const res = await apiCall<{ message?: string; data?: StoryThemes }>(
      API_CONFIG.ENDPOINTS.THEMES.GET_ALL,
      {
        method: "GET",
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data;
    if (body?.data && Array.isArray(body.data.finance) && Array.isArray(body.data.story)) {
      return { success: true, data: body.data };
    }

    return {
      success: false,
      error: "Invalid themes response.",
    };
  },
};

/**
 * Children API calls
 */
export const childrenApi = {
  register: async (username: string, pin: string, parentId?: string) => {
    const payload = parentId ? { name: username, pin, parentId } : { name: username, pin };

    return apiCall(API_CONFIG.ENDPOINTS.CHILDREN.REGISTER, {
      method: "POST",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
      // backend expects `name` field
      body: JSON.stringify(payload),
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

    const body = res.data;
    if (body && Array.isArray(body.data)) {
      return { success: true, data: body.data };
    }

    // Fallback: if API already returned a raw array of child objects
    if (Array.isArray(res.data)) {
      return { success: true, data: res.data as ChildProfile[] };
    }

    return { success: true, data: [] };
  },

  delete: async (childId: string) => {
    const endpoint = API_CONFIG.ENDPOINTS.CHILDREN.DELETE.replace(":id", childId);
    return apiCall(endpoint, {
      method: "DELETE",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
    });
  },
};
