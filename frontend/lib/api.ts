import axios from "axios";
import Cookies from "js-cookie";

// Central axios instance. All API calls go through here so auth headers
// and error handling stay in one place.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Types shared with the .NET API DTOs ----
export interface UserSummary {
  id: string;
  email: string;
  role: "User" | "Admin";
  displayName?: string;
  photoUrl?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserSummary;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  bio: string;
  city: string;
  photoUrl?: string;
  interests: string[];
}

export interface MatchResponse {
  matchId: string;
  otherUserId: string;
  otherDisplayName: string;
  otherPhotoUrl?: string;
  matchedAt: string;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  isBanned: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  displayName?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalMatches: number;
  totalMessages: number;
  newUsersLast7Days: number;
  bannedUsers: number;
}

// ---- Auth ----
export const signup = (data: {
  email: string;
  password: string;
  displayName: string;
  age: number;
  gender: string;
}) => api.post<AuthResponse>("/auth/signup", data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>("/auth/login", data).then((r) => r.data);

// ---- Profiles ----
export const getMyProfile = () =>
  api.get<ProfileResponse>("/profiles/me").then((r) => r.data);

export const updateMyProfile = (data: Partial<ProfileResponse>) =>
  api.put<ProfileResponse>("/profiles/me", data).then((r) => r.data);

export const discoverProfiles = () =>
  api.get<ProfileResponse[]>("/profiles/discover").then((r) => r.data);

// ---- Matches ----
export const likeUser = (targetUserId: string) =>
  api.post<{ matched: boolean }>(`/matches/like/${targetUserId}`).then((r) => r.data);

export const passUser = (targetUserId: string) =>
  api.post(`/matches/pass/${targetUserId}`);

export const getMyMatches = () =>
  api.get<MatchResponse[]>("/matches").then((r) => r.data);

// ---- Messages ----
export const getMessages = (matchId: string) =>
  api.get<MessageResponse[]>(`/matches/${matchId}/messages`).then((r) => r.data);

export const sendMessage = (matchId: string, content: string) =>
  api.post<MessageResponse>(`/matches/${matchId}/messages`, { content }).then((r) => r.data);

// ---- Admin ----
export const getAdminStats = () =>
  api.get<AdminStats>("/admin/stats").then((r) => r.data);

export const getAdminUsers = (search?: string) =>
  api.get<AdminUserRow[]>("/admin/users", { params: { search } }).then((r) => r.data);

export const banUser = (userId: string) => api.post(`/admin/users/${userId}/ban`);
export const unbanUser = (userId: string) => api.post(`/admin/users/${userId}/unban`);
export const deleteUser = (userId: string) => api.delete(`/admin/users/${userId}`);
