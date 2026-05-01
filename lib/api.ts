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

export interface StoryTheme {
  title: string;
  fullStory: string;
}

export interface GeneratedStoryHeader extends StoryTheme {
  id?: string;
  topic?: string;
  customPrompt?: string;
  createdAt?: string;
}

export interface StoryThemes {
  finance: ThemeTopic[];
  story: StoryTheme[];
}

export interface GenerateStoryHeaderPayload {
  topic: string;
  story: {
    title: string;
    full_story: string;
  };
  customPrompt: string;
}

export interface SavingGoal {
  id: string;
  market_id: string;
  goal_name: string;
  target_coin: number;
  current_coin: number;
}

const AUTH_TOKEN_KEY = "tomoAuthToken";
<<<<<<< HEAD

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
=======
const CHILD_AUTH_TOKEN_KEY = "tomoChildAuthToken";
const AUTH_TOKEN_FALLBACK_KEYS = ["accessToken", "token"];
let pendingCoinsRequest: Promise<ApiResponse<number>> | null = null;
let coinsEndpointUnavailable = false;
>>>>>>> dcffc85 (feat: implement child profile management and saving goals functionality)

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

function getStringField(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizeStoryHeader(data: unknown): GeneratedStoryHeader | null {
  if (!isRecord(data)) return null;

  const source = isRecord(data.data) ? data.data : data;
  const storySource = isRecord(source.story) ? source.story : source;

  const title =
    getStringField(storySource, ["title", "storyTitle", "header", "name"]) ||
    getStringField(source, ["title", "storyTitle", "header", "name"]);
  const fullStory =
    getStringField(storySource, [
      "fullStory",
      "full_story",
      "story",
      "content",
      "body",
      "description",
    ]) ||
    getStringField(source, [
      "fullStory",
      "full_story",
      "story",
      "content",
      "body",
      "description",
    ]);

  if (!title && !fullStory) return null;

  return {
    id: getStringField(source, ["id", "_id", "storyHeaderId"]),
    title: title || "Generated Story",
    fullStory,
    topic: getStringField(source, ["topic"]) || getStringField(storySource, ["topic"]),
    customPrompt:
      getStringField(source, ["customPrompt", "custom_prompt"]) ||
      getStringField(storySource, ["customPrompt", "custom_prompt"]),
    createdAt: getStringField(source, ["createdAt", "created_at"]),
  };
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];

  const candidates = [
    data.data,
    data.storyHeaders,
    data.story_headers,
    data.stories,
    data.results,
    data.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  if (isRecord(data.data)) {
    return extractArray(data.data);
  }

  return [];
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
        error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
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

  getStoryHeaders: async (): Promise<ApiResponse<GeneratedStoryHeader[]>> => {
    const res = await apiCall(API_CONFIG.ENDPOINTS.PARENT.STORY_HEADERS, {
      method: "GET",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error };

    return {
      success: true,
      data: extractArray(res.data)
        .map(normalizeStoryHeader)
        .filter((story): story is GeneratedStoryHeader => Boolean(story)),
    };
  },

  generateStoryHeaders: async (
    payload: GenerateStoryHeaderPayload
  ): Promise<ApiResponse<GeneratedStoryHeader>> => {
    const res = await apiCall(API_CONFIG.ENDPOINTS.PARENT.GENERATE_STORY_HEADERS, {
      method: "POST",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.success) return { success: false, error: res.error };

    return {
      success: true,
      data: normalizeStoryHeader(res.data) ?? {
        title: payload.story.title,
        fullStory: payload.story.full_story,
        topic: payload.topic,
        customPrompt: payload.customPrompt,
        createdAt: new Date().toISOString(),
      },
    };
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
<<<<<<< HEAD
=======

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

    const res = await apiCall<{ message?: string; data?: SavingGoal }>(
      `${API_CONFIG.ENDPOINTS.CHILDREN.SAVING_GOAL}/${encodeURIComponent(marketId)}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (body?.data && typeof body.data === "object") {
      return { success: true, data: body.data as SavingGoal };
    }

    return { success: false, error: "Saving goal tidak valid." };
  },

>>>>>>> dcffc85 (feat: implement child profile management and saving goals functionality)
};
