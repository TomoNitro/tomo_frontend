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
      UPDATE: "/api/parent/update",
    },
    PARENT: {
      INFO: "/api/parent/info",
      STORY_HEADERS: "/api/parent/story-headers",
      GENERATE_STORY_HEADERS: "/api/parent/story-headers/generate",
    },
    THEMES: {
      GET_ALL: "/api/themes",
    },
    CHILDREN: {
      REGISTER: "/api/children/register",
      LOGIN: "/api/children/login",
      UPDATE_NAME: "/api/children/name",
      GET_LIST: "/api/children",
      DELETE: "/api/children/:id",
      MARKETS: "/api/children/markets",
      COINS: "/api/children/coins",
      SAVING_GOAL: "/api/children/saving-goal",
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
