import type {
  User,
  Student,
  Teacher,
  Coordinator,
} from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

const BASE_URL = "/api";

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { requiresAuth = true, ...customConfig } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(requiresAuth
      ? { Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}` }
      : {}),
    ...customConfig.headers,
  };

  const config = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage =
        data.message || "Une erreur est survenue lors de la requête.";
      throw new Error(errorMessage, { cause: response.statusText });
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    const data = await response.json();
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

export interface DefenseSettings {
  startTime: string;
  endTime: string;
  defenseDuration: number;
  breakDuration: number;
  groupCreationStartDate: string;
  groupCreationEndDate: string;
}
