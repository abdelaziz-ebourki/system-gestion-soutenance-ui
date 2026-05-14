import type { Department, Session, Room } from "@/types";

const BASE_URL = "/api";

interface ApiOptions extends RequestInit {
	requiresAuth?: boolean;
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
	const { requiresAuth = true, ...customConfig } = options;

	const headers = {
		"Content-Type": "application/json",
		...(requiresAuth
			? { Authorization: `Bearer ${localStorage.getItem("token")}` }
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

// --- Department Services ---
export const getDepartments = () => api<Department[]>("/admin/departments");
export const createDepartment = (data: Omit<Department, "id">) =>
	api<Department>("/admin/departments", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateDepartment = (id: string, data: Omit<Department, "id">) =>
	api<Department>(`/admin/departments/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteDepartment = (id: string) =>
	api<void>(`/admin/departments/${id}`, { method: "DELETE" });

// --- Session Services ---
export const getSessions = () => api<Session[]>("/admin/sessions");
export const createSession = (data: Omit<Session, "id">) =>
	api<Session>("/admin/sessions", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateSession = (id: string, data: Omit<Session, "id">) =>
	api<Session>(`/admin/sessions/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteSession = (id: string) =>
	api<void>(`/admin/sessions/${id}`, { method: "DELETE" });

// --- Room Services ---
export const getRooms = () => api<Room[]>("/admin/rooms");
export const createRoom = (data: Omit<Room, "id">) =>
	api<Room>("/admin/rooms", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateRoom = (id: string, data: Omit<Room, "id">) =>
	api<Room>(`/admin/rooms/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteRoom = (id: string) =>
	api<void>(`/admin/rooms/${id}`, { method: "DELETE" });
