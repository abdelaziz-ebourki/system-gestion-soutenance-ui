import { api } from "./api";

export const login = (email: string, password: string) =>
  api<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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
