import { api } from "./api-core";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export const login = (credentials: {
  email: string;
  password?: string;
}) =>
  api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });

export const forgotPassword = (email: string) =>
  api<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    requiresAuth: false,
  });

export const resetPassword = (token: string, password: string) =>
  api<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
    requiresAuth: false,
  });

export const verifyAccount = (token: string, password: string) =>
  api<void>("/auth/verify-account", {
    method: "POST",
    body: JSON.stringify({ token, password }),
    requiresAuth: false,
  });

export const updateProfile = (data: { firstName: string; lastName: string }) =>
  api<User>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) =>
  api<void>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
