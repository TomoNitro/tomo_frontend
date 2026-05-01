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
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  login: async (username: string, password: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
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
  register: async (username: string, pin: string, parentId?: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.CHILDREN.REGISTER, {
      method: "POST",
      body: JSON.stringify({ username, pin, parentId }),
    });
  },

  login: async (username: string, pin: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.CHILDREN.LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, pin }),
    });
  },

  getList: async (parentId?: string) => {
    const params = parentId ? `?parentId=${parentId}` : "";
    return apiCall(`${API_CONFIG.ENDPOINTS.CHILDREN.GET_LIST}${params}`, {
      method: "GET",
    });
  },
};
