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

export interface ParentChildDashboard {
  decision_summary: {
    wise_count: number;
    impulsive_count: number;
    wise_percentage: number;
  };
  saving_goal: {
    goal_name: string;
    current_coin: number;
    target_coin: number;
    progress_percentage: number;
  } | null;
  story_summary: {
    total_completed_stories: number;
    good_ending: number;
    success_rate: number;
  };
  financial_trend: Array<{
    date: string;
    balance: number;
  }>;
  days_active: number;
}

export interface ParentChildDashboardSummary {
  id: string;
  child_id: string;
  summary: string;
  performance_level: string;
  suggestion: string;
  created_at: string;
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
  image_url?: string;
  created_at?: string;
}

export interface StartedStory {
  session_id: string;
  node: StoryNode;
  progress?: StoryProgress;
  summary?: StorySummary;
}

export interface StoryNode {
  node_id: string;
  audio_text: string;
  image_url?: string;
  audio_url?: string;
  is_end: boolean;
  choices?: {
    wise?: string;
    impulsive?: string;
  };
}

export interface StoryProgress {
  steps_taken?: number;
  total_steps?: number;
  percentage?: number;
}

export interface StoryAudio {
  node_id: string;
  audio_url: string;
}

export interface StorySummary {
  session_id?: string;
  summary: string;
  id?: string;
  title?: string;
  description?: string;
  image_url?: string;
  is_wise?: boolean;
  performance?: string;
  exp?: number;
  coins?: number;
  total_exp?: number;
  level?: number;
  total_coins?: number;
}

export interface MarketItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
  created_at?: string;
}

export interface ChildBadge {
  id: string;
  name: string;
  description: string;
  level_required: number;
  image_url?: string;
  earned?: boolean;
  earned_at?: string;
}

export interface ChildProgress {
  total_exp: number;
  level: number;
  next_level_exp: number;
  exp_to_next_level: number;
  badges: ChildBadge[];
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
  return (
    window.localStorage.getItem(CHILD_AUTH_TOKEN_KEY) ||
    window.localStorage.getItem("childAccessToken") ||
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("token")
  );
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

function getBooleanField(source: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "end", "done", "completed"].includes(normalized)) return true;
      if (["false", "0", "no", "continue", "ongoing"].includes(normalized)) return false;
    }
  }

  return false;
}

function getNumberField(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
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
  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();

    if (normalized.includes("load failed") || normalized.includes("failed to fetch")) {
      return "Koneksi ke server gagal. Coba login anak lagi atau cek izin CORS backend.";
    }

    return error.message;
  }
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
    image_url:
      getStringField(source, ["image_url", "imageUrl"]) ||
      getStringField(nestedStory, ["image_url", "imageUrl"]),
    created_at: getStringField(source, ["created_at", "createdAt"]),
  };
}

function normalizeChildBadge(data: unknown): ChildBadge | null {
  if (!isRecord(data)) return null;

  const id = getStringField(data, ["id", "_id", "badge_id", "badgeId"]);
  const name = getStringField(data, ["name", "title", "label"]);

  if (!id && !name) return null;

  return {
    id: id || name,
    name: name || id || "Badge",
    description: getStringField(data, ["description", "desc", "details"]),
    level_required: getNumberField(data, [
      "level_required",
      "levelRequired",
      "required_level",
      "requiredLevel",
    ]) ?? 0,
    image_url: getStringField(data, ["image_url", "imageUrl", "icon_url", "iconUrl"]) || undefined,
    earned: getBooleanField(data, ["earned", "is_earned", "isEarned", "owned"]),
    earned_at: getStringField(data, [
      "earned_at",
      "earnedAt",
      "awarded_at",
      "awardedAt",
      "created_at",
      "createdAt",
    ]) || undefined,
  };
}

function normalizeChildProgress(data: unknown): ChildProgress | null {
  if (!isRecord(data)) return null;

  const source = isRecord(data.data) ? data.data : data;
  const totalExp = getNumberField(source, ["total_exp", "totalExp", "exp", "xp"]) ?? 0;
  const level = getNumberField(source, ["level", "current_level", "currentLevel"]) ?? 1;
  const nextLevelExp =
    getNumberField(source, ["next_level_exp", "nextLevelExp", "next_level", "nextLevel"]) ??
    Math.max(50, level * 50);
  const expToNext =
    getNumberField(source, ["exp_to_next_level", "expToNextLevel", "next_level_remaining"]) ??
    Math.max(0, nextLevelExp - totalExp);
  const badgesSource =
    (isRecord(source) && Array.isArray(source.badges) ? source.badges : null) ||
    (Array.isArray(data.badges) ? data.badges : []);
  const badges = badgesSource
    .map(normalizeChildBadge)
    .filter((badge): badge is ChildBadge => Boolean(badge));

  return {
    total_exp: totalExp,
    level,
    next_level_exp: nextLevelExp,
    exp_to_next_level: expToNext,
    badges,
  };
}

function normalizeStoryNode(data: unknown): StoryNode | null {
  if (!isRecord(data)) return null;
  const choices = isRecord(data.choices) ? data.choices : {};
  const nodeId = getStringField(data, ["node_id", "nodeId", "id", "_id"]);
  const audioText = getStringField(data, ["audio_text", "audioText", "text", "content", "story"]);

  if (!nodeId && !audioText) return null;

  return {
    node_id: nodeId,
    audio_text: audioText,
    image_url: getStringField(data, ["image_url", "imageUrl"]),
    audio_url: getStringField(data, ["audio_url", "audioUrl", "audio"]),
    is_end: getBooleanField(data, ["is_end", "isEnd", "end", "completed"]),
    choices: {
      wise:
        getStringField(choices, ["wise", "Wise"]) ||
        getStringField(data, ["wise", "wise_choice", "wiseChoice"]),
      impulsive:
        getStringField(choices, ["impulsive", "Impulsive"]) ||
        getStringField(data, ["impulsive", "impulsive_choice", "impulsiveChoice"]),
    },
  };
}

function findStoryNodeSource(source: Record<string, unknown>): unknown {
  return (
    source.node ||
    source.next_node ||
    source.nextNode ||
    source.story_node ||
    source.storyNode ||
    source.current_node ||
    source.currentNode ||
    source
  );
}

function normalizeStartedStory(data: unknown, fallbackSessionId = ""): StartedStory | null {
  if (!isRecord(data)) return null;
  const source = isRecord(data.data) ? data.data : data;
  const summary = normalizeStorySummary(source);
  const node =
    normalizeStoryNode(findStoryNodeSource(source)) ||
    (getBooleanField(source, ["is_end", "isEnd", "end", "completed"]) && summary
      ? {
          node_id: getStringField(source, ["node_id", "nodeId"]) || "ending",
          audio_text: summary.title || summary.description || summary.summary,
          image_url: summary.image_url,
          is_end: true,
          choices: {},
        }
      : null);
  const sessionId = getStringField(source, ["session_id", "sessionId", "session"]) || fallbackSessionId;

  if (!sessionId || !node) return null;

  return {
    session_id: sessionId,
    node,
    progress: normalizeStoryProgress(source),
    summary,
  };
}

function normalizeStoryProgress(data: unknown): StoryProgress | undefined {
  if (!isRecord(data)) return undefined;

  const source = isRecord(data.progress) ? data.progress : data;
  const stepsTaken = getNumberField(source, ["steps_taken", "stepsTaken", "step", "current_step", "currentStep"]);
  const totalSteps = getNumberField(source, ["total_steps", "totalSteps", "total", "max_steps", "maxSteps"]);
  const percentage = getNumberField(source, ["percentage", "percent", "progress_percent", "progressPercent"]);

  if (stepsTaken === undefined && totalSteps === undefined && percentage === undefined) {
    return undefined;
  }

  return {
    steps_taken: stepsTaken,
    total_steps: totalSteps,
    percentage,
  };
}

function normalizeStorySummary(data: unknown): StorySummary | undefined {
  if (!isRecord(data)) return undefined;
  const source = isRecord(data.data) ? data.data : data;
  const summaryObject = isRecord(source.summary) ? source.summary : null;
  const resultObject = isRecord(source.result) ? source.result : null;
  const detailSource = summaryObject || resultObject || source;
  const summary =
    getStringField(detailSource, [
      "summary",
      "summary_text",
      "summaryText",
      "description",
      "text",
      "message",
      "content",
    ]) ||
    getStringField(source, ["summary", "summary_text", "summaryText", "description", "text", "message", "content"]);

  if (!summary) return undefined;

  return {
    id: getStringField(detailSource, ["id", "_id"]),
    session_id: getStringField(source, ["session_id", "sessionId"]),
    summary,
    title: getStringField(detailSource, ["title", "name"]),
    description: getStringField(detailSource, ["description", "summary", "summary_text", "summaryText"]),
    image_url: getStringField(detailSource, ["image_url", "imageUrl"]),
    is_wise: getBooleanField(detailSource, ["is_wise", "isWise", "wise"]),
    performance: getStringField(detailSource, ["performance", "performance_level", "performanceLevel"]),
    exp: getNumberField(detailSource, ["exp", "xp"]),
    coins: getNumberField(detailSource, ["coins", "coin"]),
    total_exp: getNumberField(detailSource, ["total_exp", "totalExp"]),
    level: getNumberField(detailSource, ["level"]),
    total_coins: getNumberField(detailSource, ["total_coins", "totalCoins"]),
  };
}

function findAudioSource(data: unknown): Record<string, unknown> | null {
  if (!isRecord(data)) return null;

  const candidates = [
    data.data,
    data.audio,
    data.result,
    isRecord(data.data) ? data.data.audio : undefined,
    isRecord(data.data) ? data.data.result : undefined,
    data,
  ];

  return candidates.find(isRecord) ?? null;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isTemporaryGatewayError(status?: number) {
  return status === 502 || status === 503 || status === 504;
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
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error:
          (isRecord(data) && (String(data.error || data.message || ""))) ||
          `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: data as T,
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

  deleteAccount: async () => {
    const endpoints = [
      API_CONFIG.ENDPOINTS.USER.DELETE,
      "/api/user/delete",
      "/api/parent/delete",
    ];

    let lastResponse: ApiResponse = { success: false, error: "Failed to delete account." };

    for (const endpoint of endpoints) {
      const response = await apiCall(endpoint, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...authHeaders(),
        },
      });

      if (response.success) return response;
      lastResponse = response;

      if (response.status && response.status !== 404 && response.status !== 405) {
        return response;
      }
    }

    return lastResponse;
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

  getChildDashboard: async (childId: string): Promise<ApiResponse<ParentChildDashboard>> => {
    const endpoint = API_CONFIG.ENDPOINTS.PARENT.CHILD_DASHBOARD.replace(":childId", childId);
    const res = await apiCall<{ message?: string; data?: ParentChildDashboard }>(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error };

    if (res.data?.data) {
      return { success: true, data: res.data.data };
    }

    if (isRecord(res.data)) {
      return { success: true, data: res.data as unknown as ParentChildDashboard };
    }

    return { success: false, error: "Dashboard anak tidak valid." };
  },

  getChildDashboardSummary: async (childId: string): Promise<ApiResponse<ParentChildDashboardSummary>> => {
    const endpoint = API_CONFIG.ENDPOINTS.PARENT.CHILD_DASHBOARD_SUMMARY.replace(":childId", childId);
    const res = await apiCall<{ message?: string; data?: ParentChildDashboardSummary }>(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error, status: res.status };

    if (res.data?.data) {
      return { success: true, data: res.data.data };
    }

    if (isRecord(res.data)) {
      return { success: true, data: res.data as unknown as ParentChildDashboardSummary };
    }

    return { success: false, error: "Summary dashboard anak tidak valid." };
  },

  generateChildDashboardSummary: async (childId: string): Promise<ApiResponse<ParentChildDashboardSummary>> => {
    const endpoint = API_CONFIG.ENDPOINTS.PARENT.GENERATE_CHILD_DASHBOARD_SUMMARY.replace(":childId", childId);
    const res = await apiCall<{ message?: string; data?: ParentChildDashboardSummary }>(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error, status: res.status };

    if (res.data?.data) {
      return { success: true, data: res.data.data };
    }

    if (isRecord(res.data)) {
      return { success: true, data: res.data as unknown as ParentChildDashboardSummary };
    }

    return { success: false, error: "Summary dashboard anak tidak valid." };
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

  startStory: async (storyId: string): Promise<ApiResponse<StartedStory>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const endpoint = API_CONFIG.ENDPOINTS.CHILDREN.START_STORY.replace(":storyId", storyId);
    const res = await apiCall(
      endpoint,
      {
        method: "POST",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
      }
    );

    if (!res.success) return { success: false, error: res.error };

    const story = normalizeStartedStory(res.data);
    if (!story) return { success: false, error: "Data story tidak valid." };

    return { success: true, data: story };
  },

  makeStoryDecision: async (
    sessionId: string,
    nodeId: string,
    choice: "wise" | "impulsive"
  ): Promise<ApiResponse<StartedStory>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const endpoint = API_CONFIG.ENDPOINTS.SESSIONS.DECISION.replace(":sessionId", sessionId);
    const res = await apiCall(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        ...childAuthHeaders(),
      },
      body: JSON.stringify({ node_id: nodeId, choice }),
    });

    if (!res.success) return { success: false, error: res.error };

    const story = normalizeStartedStory(res.data, sessionId);
    if (!story) return { success: false, error: "Data keputusan story tidak valid." };

    return { success: true, data: story };
  },

  generateStoryNodeAudio: async (nodeId: string): Promise<ApiResponse<StoryAudio>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const endpoint = API_CONFIG.ENDPOINTS.CHILDREN.STORY_NODE_AUDIO.replace(":nodeId", nodeId);
    const requestAudio = () =>
      apiCall(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
      });

    let res = await requestAudio();

    if (!res.success && isTemporaryGatewayError(res.status)) {
      await wait(1200);
      res = await requestAudio();
    }

    if (!res.success) {
      return {
        success: false,
        error: isTemporaryGatewayError(res.status)
          ? "Server audio sedang sibuk. Coba lagi sebentar lagi."
          : res.error,
        status: res.status,
      };
    }

    const source = findAudioSource(res.data);
    if (!isRecord(source)) return { success: false, error: "Data audio tidak valid." };

    const audioUrl = getStringField(source, ["audio_url", "audioUrl", "url", "public_url", "publicUrl", "audio"]);
    if (!audioUrl) return { success: false, error: "URL audio tidak tersedia." };

    return {
      success: true,
      data: {
        node_id: getStringField(source, ["node_id", "nodeId"]) || nodeId,
        audio_url: audioUrl,
      },
    };
  },

  getStorySummary: async (sessionId: string): Promise<ApiResponse<StorySummary>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const generateEndpoint = API_CONFIG.ENDPOINTS.SESSIONS.SUMMARY_GENERATE.replace(
      ":sessionId",
      sessionId
    );
    const readEndpoint = API_CONFIG.ENDPOINTS.SESSIONS.SUMMARY.replace(":sessionId", sessionId);
    const requestSummary = (endpoint: string, method: "GET" | "POST") =>
      apiCall(endpoint, {
        method,
        credentials: "include",
        headers: {
          ...childAuthHeaders(),
        },
      });
    let res = await requestSummary(generateEndpoint, "POST");

    if (!res.success && (res.status === 404 || res.status === 405)) {
      res = await requestSummary(readEndpoint, "POST");
    }

    if (!res.success && (res.status === 404 || res.status === 405)) {
      res = await requestSummary(readEndpoint, "GET");
    }

    if (!res.success) return { success: false, error: res.error };

    const summary = normalizeStorySummary(res.data);
    if (!summary) return { success: false, error: "Data summary tidak valid." };

    return {
      success: true,
      data: {
        session_id: summary.session_id || sessionId,
        summary: summary.summary,
        id: summary.id,
        title: summary.title,
        description: summary.description,
        image_url: summary.image_url,
        is_wise: summary.is_wise,
        performance: summary.performance,
        exp: summary.exp,
        coins: summary.coins,
        total_exp: summary.total_exp,
        level: summary.level,
        total_coins: summary.total_coins,
      },
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
      const res = await apiCall<{
        message?: string;
        amount?: number | string;
        data?: { amount?: number | string };
      }>(
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

      const body = res.data as { amount?: unknown; data?: { amount?: unknown } };
      const amount = body?.data?.amount ?? body?.amount;
      const parsedAmount =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? Number(amount)
            : Number.NaN;

      if (Number.isFinite(parsedAmount)) {
        return { success: true, data: parsedAmount };
      }

      return { success: false, error: "Format data koin tidak valid." };
    })();

    const response = await pendingCoinsRequest;
    pendingCoinsRequest = null;
    return response;
  },

  getProgress: async (): Promise<ApiResponse<ChildProgress>> => {
    if (!hasChildToken()) {
      return {
        success: false,
        error: "Token anak belum ada. Login sebagai anak dulu.",
      };
    }

    const res = await apiCall(API_CONFIG.ENDPOINTS.CHILDREN.PROGRESS, {
      method: "GET",
      credentials: "include",
      headers: {
        ...childAuthHeaders(),
      },
    });

    if (!res.success) return { success: false, error: res.error, status: res.status };

    const progress = normalizeChildProgress(res.data);
    if (!progress) return { success: false, error: "Data progress anak tidak valid." };

    return { success: true, data: progress };
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
      { endpoint: `${endpoint}/${marketId}`, method: "POST" },
      { endpoint, method: "POST" },
      { endpoint: `${endpoint}/${marketId}`, method: "PUT" },
      { endpoint, method: "PUT" },
    ];

    let res: ApiResponse<{ message?: string; data?: SavingGoal }> = {
      success: false,
      error: "Saving goal belum bisa disimpan.",
    };

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

    if (isRecord(res.data)) {
      const directGoal = res.data as Record<string, unknown>;
      if (directGoal.market_id || directGoal.id) {
        return { success: true, data: directGoal as unknown as SavingGoal };
      }
    }

    return {
      success: true,
      data: {
        id: marketId,
        market_id: marketId,
        goal_name: "",
      } as SavingGoal,
    };
  },

};
