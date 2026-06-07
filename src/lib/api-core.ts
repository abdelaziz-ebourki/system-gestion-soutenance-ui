import { ApiError } from "@/lib/api-error";
import type {
  Student,
  Teacher,
  Coordinator,
  AppNotification,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

export const DEFAULT_TIMEOUT = 15_000;

function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
  responseType?: "json" | "blob";
  timeout?: number;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { responseType = "json", timeout = DEFAULT_TIMEOUT, ...customConfig } = options;

  const headers: Record<string, string> = {
    ...customConfig.headers as Record<string, string> | undefined,
  };

  const method = (customConfig.method || "GET").toUpperCase();
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  if (responseType === "json" && !(customConfig.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config: RequestInit = {
    ...customConfig,
    method,
    headers,
    credentials: customConfig.credentials || "include",
    signal: controller.signal,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 && !endpoint.startsWith("/auth/")) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
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
      throw new ApiError({
        status: response.status,
        message: errorMessage,
        fieldErrors: data?.fieldErrors as Record<string, string> | undefined,
      });
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
    clearTimeout(timeoutId);

    if (controller.signal.aborted) {
      throw new ApiError({
        status: null,
        message: "La requête a expiré. Veuillez réessayer.",
        isTimeout: true,
      });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError({
        status: null,
        message: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        isNetworkError: true,
      });
    }

    throw new ApiError({
      status: null,
      message: "Une erreur inattendue est survenue.",
    });
  }
}

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
