import { api, type PaginatedResponse, type UserCreateParams, type RoomImportData, type DefenseSettings, type GeneralSettings, type DefenseTypeConfig, type DocumentConfig } from "./api-core";
import type { DashboardStats, DefenseSession, JuryRoleTemplate } from "@/types";
import type { AuditLog } from "@/types/audit-log";
import type {
  User, Student, Teacher, Coordinator,
  Department, Session, Room, Major, Level, Grade,
} from "@/types";

export const getAdminStats = () => api<DashboardStats>("/admin/stats");

export const getAuditLogs = () => api<AuditLog[]>("/admin/audit-logs");

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

export const getStudents = (page = 0, limit = 10) =>
  api<PaginatedResponse<Student>>(
    `/admin/students?page=${page}&limit=${limit}`,
  );

export const getTeachers = (page = 0, limit = 10) =>
  api<PaginatedResponse<Teacher>>(
    `/admin/teachers?page=${page}&limit=${limit}`,
  );

export const getTeachersList = () =>
  api<PaginatedResponse<Teacher>>("/admin/teachers?limit=1000").then(
    (res) => res.items,
  );

export const getStudentsList = () =>
  api<PaginatedResponse<Student>>("/admin/students?limit=1000").then(
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

export const bulkCreateUsers = (
  users: Record<string, string | number>[],
  role: string,
) =>
  api<User[]>("/admin/users/bulk", {
    method: "POST",
    body: JSON.stringify({ users, role }),
  });

export const bulkCreateRooms = (rooms: RoomImportData[]) =>
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

export const getDefenseSessions = () => api<DefenseSession[]>("/admin/defense-sessions");
export const createDefenseSession = (data: Omit<DefenseSession, "id">) =>
  api<DefenseSession>("/admin/defense-sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateDefenseSession = (id: string, data: Omit<DefenseSession, "id">) =>
  api<DefenseSession>(`/admin/defense-sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteDefenseSession = (id: string) =>
  api<void>(`/admin/defense-sessions/${id}`, { method: "DELETE" });


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

export const getMajors = () => api<Major[]>("/admin/config/majors");
export const createMajor = (data: Omit<Major, "id">) =>
  api<Major>("/admin/config/majors", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateMajor = (id: string, data: Omit<Major, "id">) =>
  api<Major>(`/admin/config/majors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteMajor = (id: string) =>
  api<void>(`/admin/config/majors/${id}`, { method: "DELETE" });

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

export const getJuryRoleTemplates = () => api<JuryRoleTemplate[]>("/admin/config/jury-role-templates");
export const createJuryRoleTemplate = (data: Omit<JuryRoleTemplate, "id">) =>
  api<JuryRoleTemplate>("/admin/config/jury-role-templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateJuryRoleTemplate = (id: string, data: Omit<JuryRoleTemplate, "id">) =>
  api<JuryRoleTemplate>(`/admin/config/jury-role-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteJuryRoleTemplate = (id: string) =>
  api<void>(`/admin/config/jury-role-templates/${id}`, { method: "DELETE" });

export const getDefenseSettings = () =>
  api<DefenseSettings>("/admin/config/settings");
export const updateDefenseSettings = (data: DefenseSettings) =>
  api<DefenseSettings>("/admin/config/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getGeneralSettings = () =>
  api<GeneralSettings>("/admin/config/general");
export const updateGeneralSettings = (data: GeneralSettings) =>
  api<GeneralSettings>("/admin/config/general", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const getDefenseTypeConfig = () =>
  api<DefenseTypeConfig>("/admin/config/defense-types");
export const updateDefenseTypeConfig = (data: DefenseTypeConfig) =>
  api<DefenseTypeConfig>("/admin/config/defense-types", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const getDocumentConfig = () =>
  api<DocumentConfig>("/admin/config/documents");
export const updateDocumentConfig = (data: DocumentConfig) =>
  api<DocumentConfig>("/admin/config/documents", {
    method: "PUT",
    body: JSON.stringify(data),
  });
