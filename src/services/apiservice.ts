import { Recipe } from "../types";

const API_BASE = "/api";

export const apiService = {
  async signup(data: any) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    return res.json();
  },

  async updateUserData(data: { favorites?: Recipe[]; history?: Recipe[]; preferences?: any }) {
    const res = await fetch(`${API_BASE}/user/data`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async startSession(visitorId: string, userId?: string) {
    const res = await fetch(`${API_BASE}/analytics/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, userId }),
    });
    return res.json();
  },

  async endSession(sessionId: string) {
    const res = await fetch(`${API_BASE}/analytics/session/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
