/**
 * API Service
 * Centralized API calls with error handling
 */

import { API_CONFIG } from "./config";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
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

export interface ChildStoryHeader {
  id: string;
  title: string;
  fullStory: string;
  topic?: string;
  created_at?: string;
}

export interface MarketItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
  created_at?: string;
}

const AUTH_TOKEN_KEY = "tomoAuthToken";
const CHILD_AUTH_TOKEN_KEY = "tomoChildAuthToken";
const AUTH_TOKEN_FALLBACK_KEYS = ["accessToken", "token"];
let pendingCoinsRequest: Promise<ApiResponse<number>> | null = null;
let coinsEndpointUnavailable = false;

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
  if (t) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, t);
    window.localStorage.setItem("accessToken", t);
  }
}

function storeParentProfileFromResponse(data: unknown) {
  if (typeof window === "undefined") return;
  if (!data || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const src =
    (d.user && typeof d.user === "object" ? d.user : null) ||
    (d.data && typeof d.data === "object" ? d.data : null) ||
    (d.profile && typeof d.profile === "object" ? d.profile : null) ||
    (d.parent && typeof d.parent === "object" ? d.parent : null) ||
    d;
  const source = src as Record<string, unknown>;

  const name =
    (source.username || source.name || source.fullName || source.full_name) || "";
  const email = source.email || "";
  const id = source.id || source._id || source.parentId || "";

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

function getChildStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHILD_AUTH_TOKEN_KEY);
}

function childAuthHeaders(): Record<string, string> {
  const t = getChildStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function hasChildToken(): boolean {
  return Boolean(getChildStoredToken());
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

function normalizeChildStoryHeader(item: unknown): ChildStoryHeader | null {
  if (!item || typeof item !== "object") return null;

  const source = item as Record<string, unknown>;
  const nestedStory =
    source.story && typeof source.story === "object"
      ? (source.story as Record<string, unknown>)
      : source;
  const title =
    getStringField(nestedStory, ["title", "storyTitle", "name"]) ||
    getStringField(source, ["title", "storyTitle", "name"]);
  const fullStory =
    getStringField(nestedStory, ["fullStory", "full_story", "story", "content", "description"]) ||
    getStringField(source, ["fullStory", "full_story", "story", "content", "description"]);

  if (!title && !fullStory) return null;

  return {
    id: getStringField(source, ["id", "_id", "storyHeaderId"]) || `${title}-${fullStory}`,
    title: title || "Untitled Story",
    fullStory,
    topic: getStringField(source, ["topic"]) || getStringField(nestedStory, ["topic"]),
    created_at: getStringField(source, ["created_at", "createdAt"]),
  };
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

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
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

  getStoryHeaders: async (): Promise<ApiResponse<ChildStoryHeader[]>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const res = await apiCall(API_CONFIG.ENDPOINTS.CHILDREN.STORY_HEADERS, {
      method: "GET",
      credentials: "include",
      headers: {
        ...childAuthHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error };

    return {
      success: true,
      data: extractArray(res.data)
        .map(normalizeChildStoryHeader)
        .filter((story): story is ChildStoryHeader => Boolean(story)),
    };
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

    const endpoint = API_CONFIG.ENDPOINTS.CHILDREN.SAVING_GOAL;
    const payload = JSON.stringify({ marketId, market_id: marketId });
    const attempts: Array<{ endpoint: string; method: string }> = [
      { endpoint, method: "POST" },
      { endpoint, method: "PUT" },
      { endpoint, method: "PATCH" },
      { endpoint: `${endpoint}/${marketId}`, method: "POST" },
      { endpoint: `${endpoint}/${marketId}`, method: "PUT" },
      { endpoint: `${endpoint}/${marketId}`, method: "PATCH" },
    ];

    let res: ApiResponse<{ message?: string; data?: SavingGoal }> | null = null;

    for (const attempt of attempts) {
      res = await apiCall<{ message?: string; data?: SavingGoal }>(attempt.endpoint, {
        method: attempt.method,
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
        body: payload,
      });

      if (res.success || (res.status !== 404 && res.status !== 405)) {
        break;
      }
    }

    if (!res.success) return { success: false, error: res.error };

    const body = res.data as { data?: unknown };
    if (body?.data && typeof body.data === "object") {
      return { success: true, data: body.data as SavingGoal };
    }

    return { success: false, error: "Saving goal tidak valid." };
  },

};
