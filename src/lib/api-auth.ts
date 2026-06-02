import { api } from "./api";
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
  });

export const resetPassword = (token: string, password: string) =>
  api<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

export const verifyAccount = (token: string, password: string) =>
  api<void>("/auth/verify-account", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
