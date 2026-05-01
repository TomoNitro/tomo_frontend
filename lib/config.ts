/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://tomobackend-production-51a6.up.railway.app";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/user/register",
      LOGIN: "/api/user/login",
      LOGOUT: "/api/user/logout",
    },
    USER: {
      PROFILE: "/api/user/profile",
      UPDATE: "/api/user/update",
    },
    CHILDREN: {
      REGISTER: "/api/children/register",
      LOGIN: "/api/children/login",
      GET_LIST: "/api/children",
    },
  },
};

/**
 * Get full API URL
 * @param endpoint - The endpoint path
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}
