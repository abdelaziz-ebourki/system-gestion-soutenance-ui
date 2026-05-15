import type {
	User,
	Department,
	Session,
	Room,
	Student,
	Teacher,
	Coordinator,
	DashboardStats,
	Filiere,
	Level,
	Grade,
} from "@/types";

const BASE_URL = "/api";

interface ApiOptions extends RequestInit {
	requiresAuth?: boolean;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
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

// --- Dashboard Services ---
export const getAdminStats = () => api<DashboardStats>("/admin/stats");

// --- User Services ---
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	pageCount: number;
}

export type UserCreateParams = Omit<Student, "id"> | Omit<Teacher, "id"> | Omit<Coordinator, "id">;

export const getUsers = (params: {
	role?: string;
	page?: number;
	limit?: number;
}) => {
	const query = new URLSearchParams();
	if (params.role) query.append("role", params.role);
	if (params.page !== undefined) query.append("page", params.page.toString());
	if (params.limit !== undefined)
		query.append("limit", params.limit.toString());

	return api<PaginatedResponse<User>>(`/admin/users?${query.toString()}`);
};

// Role-specific helpers for clarity
export const getStudents = (page = 0, limit = 10) =>
	getUsers({ role: "student", page, limit }) as unknown as Promise<
		PaginatedResponse<Student>
	>;

export const getTeachers = (page = 0, limit = 10) =>
	getUsers({ role: "teacher", page, limit }) as unknown as Promise<
		PaginatedResponse<Teacher>
	>;

// Non-paginated teachers list for selections
export const getTeachersList = () =>
	api<PaginatedResponse<Teacher>>("/admin/users?role=teacher&limit=1000").then(
		(res) => res.items,
	);

export const getCoordinators = (page = 0, limit = 10) =>
	getUsers({ role: "coordinator", page, limit }) as unknown as Promise<
		PaginatedResponse<Coordinator>
	>;

export const createUser = (data: UserCreateParams) =>
	api<User>("/admin/users", {
		method: "POST",
		body: JSON.stringify(data),
	});

export const bulkCreateUsers = (users: any[], role: string) =>
	api<User[]>("/admin/users/bulk", {
		method: "POST",
		body: JSON.stringify({ users, role }),
	});

export const updateUser = (id: string, data: Partial<UserCreateParams>) =>
	api<User>(`/admin/users/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});

export const deleteUser = (id: string) =>
	api<void>(`/admin/users/${id}`, { method: "DELETE" });

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

// --- Configuration Services ---
export const getFilieres = () => api<Filiere[]>("/admin/config/filieres");
export const createFiliere = (data: Omit<Filiere, "id">) =>
	api<Filiere>("/admin/config/filieres", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateFiliere = (id: string, data: Omit<Filiere, "id">) =>
	api<Filiere>(`/admin/config/filieres/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteFiliere = (id: string) =>
	api<void>(`/admin/config/filieres/${id}`, { method: "DELETE" });

export const getLevels = () => api<Level[]>("/admin/config/levels");
export const createLevel = (data: Omit<Level, "id">) =>
	api<Level>("/admin/config/levels", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateLevel = (id: string, data: Omit<Level, "id">) =>
	api<Level>(`/admin/config/levels/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteLevel = (id: string) =>
	api<void>(`/admin/config/levels/${id}`, { method: "DELETE" });

export const getGrades = () => api<Grade[]>("/admin/config/grades");
export const createGrade = (data: Omit<Grade, "id">) =>
	api<Grade>("/admin/config/grades", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateGrade = (id: string, data: Omit<Grade, "id">) =>
	api<Grade>(`/admin/config/grades/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteGrade = (id: string) =>
	api<void>(`/admin/config/grades/${id}`, { method: "DELETE" });
