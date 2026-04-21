import { Recipe, Feedback, GroupedFeedback, AnalyticsData } from "../types";

const API_BASE = "/api";

async function handleResponse(res: Response) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (res.ok) {
      throw new Error(`Expected JSON but received: ${text.substring(0, 100)}...`);
    }
    throw new Error(`Request failed with status ${res.status}: ${text.substring(0, 100)}...`);
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const apiService = {
  async signup(data: any): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/auth/signup`);
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async login(data: any): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/auth/login`);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async logout(): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/auth/logout`);
    const res = await fetch(`${API_BASE}/auth/logout`, { 
      method: "POST",
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getMe(): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/auth/me`);
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    if (res.status === 401) return null;
    return handleResponse(res);
  },

  async updateUserData(data: { favorites?: Recipe[]; history?: Recipe[]; preferences?: any }): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/user/data`);
    const res = await fetch(`${API_BASE}/user/data`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async startSession(visitorId: string, userId?: string): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/analytics/session/start`);
    const res = await fetch(`${API_BASE}/analytics/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, userId }),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async heartbeat(sessionId: string, userId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/session/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userId }),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async endSession(sessionId: string): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/analytics/session/end`);
    const res = await fetch(`${API_BASE}/analytics/session/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      credentials: 'include'
    });
    return handleResponse(res).catch(() => ({}));
  },

  async getAnalytics(): Promise<AnalyticsData> {
    console.log(`🚀 Fetching: ${API_BASE}/analytics`);
    const res = await fetch(`${API_BASE}/analytics`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async submitFeedback(data: { rating: number, userId?: string, visitorId: string, comment?: string, recipeId?: string, recipeTitle?: string }): Promise<any> {
    console.log(`🚀 Fetching: ${API_BASE}/feedback`);
    const res = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getCommunityFeedback(): Promise<GroupedFeedback[]> {
    console.log(`🚀 Fetching: ${API_BASE}/community-feedback`);
    const res = await fetch(`${API_BASE}/community-feedback`);
    return handleResponse(res);
  }
};
