import type {
  User,
  Student,
  Teacher,
  Coordinator,
  AppNotification,
} from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  responseType?: "json" | "blob";
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { requiresAuth = true, responseType = "json", ...customConfig } = options;

  const headers: Record<string, string> = {
    ...(requiresAuth
      ? { Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}` }
      : {}),
    ...customConfig.headers as Record<string, string> | undefined,
  };

  const method = (customConfig.method || "GET").toUpperCase();
  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  if (responseType === "json" && !(customConfig.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...customConfig,
    method,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let data: Record<string, unknown>;
      try {
        data = await (responseType === "blob"
          ? response.text().then((t) => { try { return JSON.parse(t); } catch { return {}; } })
          : response.json());
      } catch {
        data = {};
      }
      const errorMessage =
        (data?.message as string) || "Une erreur est survenue lors de la requête.";
      throw new Error(errorMessage, { cause: response.statusText });
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    const data = responseType === "blob"
      ? await response.blob()
      : await response.json();
    return data as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Une erreur inattendue est survenue.", { cause: error });
  }
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export const authenticate = (credentials: {
  email: string;
  password?: string;
}) =>
  api<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pageCount: number;
}

export type UserCreateParams =
  | Partial<Student>
  | Partial<Teacher>
  | Partial<Coordinator>;

export interface RoomImportData {
  name: string;
  capacity: number;
  departmentId: string;
  [key: string]: string | number;
}

export const getNotifications = () => api<AppNotification[]>("/notifications");

export const markNotificationRead = (id: string) =>
  api<void>(`/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsRead = () =>
  api<void>("/notifications/read-all", { method: "PATCH" });

export interface DefenseSettings {
  startTime: string;
  endTime: string;
  defenseDuration: number;
  breakDuration: number;
  groupCreationStartDate: string;
  groupCreationEndDate: string;
}

export interface GeneralSettings {
  institutionName: string;
  institutionLogoUrl: string;
  timezone: string;
  dateFormat: string;
  setupCompleted: boolean;
}

export interface DocumentConfig {
  maxFileSizeMb: number;
  allowedExtensions: string;
  versionLimit: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  senderName: string;
  senderEmail: string;
  encryption: "tls" | "ssl" | "none";
}
