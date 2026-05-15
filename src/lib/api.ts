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
	Project,
	Group,
	Jury,
	TeacherDefense,
	TeacherEvaluation,
	TeacherStats,
	TeacherUnavailability,
	StudentDefenseDetails,
	StudentDocument,
	StudentGroupDetails,
	StudentStats,
} from "@/types";
import type { AuditLog } from "@/types/audit-log";

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

// --- Audit Log Services ---
export const getAuditLogs = () => api<AuditLog[]>("/admin/audit-logs");

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

// Non-paginated students list for selections
export const getStudentsList = () =>
	api<PaginatedResponse<Student>>("/admin/users?role=student&limit=1000").then(
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

export const bulkCreateRooms = (rooms: any[]) =>
	api<Room[]>("/admin/rooms/bulk", {
		method: "POST",
		body: JSON.stringify({ rooms }),
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

export const getSessionTypes = () => api<{id: string, name: string}[]>("/admin/config/session-types");
export const createSessionType = (data: {name: string}) => api("/admin/config/session-types", { method: "POST", body: JSON.stringify(data) });
export const deleteSessionType = (id: string) => api(`/admin/config/session-types/${id}`, { method: "DELETE" });

export const getSessionStatuses = () => api<{id: string, name: string}[]>("/admin/config/session-statuses");
export const createSessionStatus = (data: {name: string}) => api("/admin/config/session-statuses", { method: "POST", body: JSON.stringify(data) });
export const deleteSessionStatus = (id: string) => api(`/admin/config/session-statuses/${id}`, { method: "DELETE" });

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
export const updateFiliere = (_id: string, data: Omit<Filiere, "id">) =>
	api<Filiere>(`/admin/config/filieres/${_id}`, {
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
export const updateLevel = (_id: string, data: Omit<Level, "id">) =>
	api<Level>(`/admin/config/levels/${_id}`, {
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
export const updateGrade = (_id: string, data: Omit<Grade, "id">) =>
	api<Grade>(`/admin/config/grades/${_id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteGrade = (id: string) =>
	api<void>(`/admin/config/grades/${id}`, { method: "DELETE" });

// --- Defense Settings ---
export interface DefenseSettings {
	startTime: string;
	endTime: string;
	defenseDuration: number;
	breakDuration: number;
}
export const getDefenseSettings = () => api<DefenseSettings>("/admin/config/settings");
export const updateDefenseSettings = (data: DefenseSettings) =>
	api<DefenseSettings>("/admin/config/settings", {
		method: "POST",
		body: JSON.stringify(data),
	});

// --- Coordinator Services ---
export interface CoordinatorStats {
	totalProjects: number;
	totalGroups: number;
	totalJuries: number;
	scheduledDefenses: number;
}

export const getCoordinatorStats = () => api<CoordinatorStats>("/coordinator/stats");

export const getProjects = () => api<Project[]>("/coordinator/projects");
export const createProject = (data: Omit<Project, "id">) =>
	api<Project>("/coordinator/projects", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateProject = (id: string, data: Partial<Project>) =>
	api<Project>(`/coordinator/projects/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteProject = (id: string) =>
	api<void>(`/coordinator/projects/${id}`, { method: "DELETE" });

export const getGroups = () => api<Group[]>("/coordinator/groups");
export const createGroup = (data: Omit<Group, "id">) =>
	api<Group>("/coordinator/groups", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const deleteGroup = (id: string) =>
	api<void>(`/coordinator/groups/${id}`, { method: "DELETE" });

export const getJurys = () => api<Jury[]>("/coordinator/jurys");
export const createJury = (data: Omit<Jury, "id">) =>
	api<Jury>("/coordinator/jurys", {
		method: "POST",
		body: JSON.stringify(data),
	});
export const updateJury = (id: string, data: Partial<Jury>) =>
	api<Jury>(`/coordinator/jurys/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
export const deleteJury = (id: string) =>
	api<void>(`/coordinator/jurys/${id}`, { method: "DELETE" });

export const saveSoutenanceSchedule = (schedule: Record<string, { id: string, title: string }>) =>
	api<void>("/coordinator/schedule", {
		method: "POST",
		body: JSON.stringify({ schedule}),
	});

// --- Teacher Services ---
export const getTeacherStats = () => api<TeacherStats>("/teacher/stats");

export const getTeacherSchedule = () => api<TeacherDefense[]>("/teacher/schedule");

export const getTeacherEvaluations = () =>
	api<TeacherEvaluation[]>("/teacher/evaluations");

export const submitTeacherEvaluation = (
	id: string,
	data: Pick<TeacherEvaluation, "score" | "comment">,
) =>
	api<TeacherEvaluation>(`/teacher/evaluations/${id}`, {
		method: "POST",
		body: JSON.stringify(data),
	});

export const getTeacherUnavailability = () =>
	api<TeacherUnavailability>("/teacher/unavailability");

export const saveTeacherUnavailability = (
	data: TeacherUnavailability,
) =>
	api<TeacherUnavailability>("/teacher/unavailability", {
		method: "POST",
		body: JSON.stringify(data),
	});

// --- Student Services ---
export const getStudentStats = () => api<StudentStats>("/student/stats");

export const getStudentDefense = () =>
	api<StudentDefenseDetails>("/student/defense");

export const getStudentGroup = () =>
	api<StudentGroupDetails>("/student/group");

export const getStudentDocuments = () =>
	api<StudentDocument[]>("/student/documents");
