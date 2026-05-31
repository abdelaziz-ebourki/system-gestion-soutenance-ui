import { api, type PaginatedResponse, type UserCreateParams, type RoomImportData, type GeneralSettings, type EmailConfig } from "./api-core";
import type { DashboardStats, JuryRoleTemplate } from "@/types";
import type { AuditLog } from "@/types/audit-log";
import type {
  User, Student, Teacher, Coordinator,
  Department, Room, Major, Level,
} from "@/types";

export const getAdminStats = () => api<DashboardStats>("/admin/stats");

export const getAuditLogs = (page = 0, limit = 20) =>
  api<PaginatedResponse<AuditLog>>(`/admin/audit-logs?page=${page}&limit=${limit}`);

export const getUsers = (params: {
  role?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params.role) query.append("role", params.role);
  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.limit !== undefined) query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);

  return api<PaginatedResponse<User>>(`/admin/users?${query.toString()}`);
};

export const getStudents = (page = 0, limit = 10, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append("search", search);
  return api<PaginatedResponse<Student>>(`/admin/students?${params}`);
};

export const getTeachers = (page = 0, limit = 10, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append("search", search);
  return api<PaginatedResponse<Teacher>>(`/admin/teachers?${params}`);
};

export const getTeachersList = (limit = 5000) =>
  api<PaginatedResponse<Teacher>>(`/admin/teachers?limit=${limit}`).then(
    (res) => res.items,
  );

export const getCoordinators = (page = 0, limit = 10, search?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append("search", search);
  return api<PaginatedResponse<Coordinator>>(`/admin/coordinators?${params}`);
};

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

export const getJuryRoleTemplates = () => api<JuryRoleTemplate[]>("/admin/config/jury-role-templates");

export const getGeneralSettings = () =>
  api<GeneralSettings>("/admin/config/general");
export const getEmailConfig = () =>
  api<EmailConfig>("/admin/config/email");
export const updateEmailConfig = (data: EmailConfig) =>
  api<EmailConfig>("/admin/config/email", {
    method: "PUT",
    body: JSON.stringify(data),
  });


