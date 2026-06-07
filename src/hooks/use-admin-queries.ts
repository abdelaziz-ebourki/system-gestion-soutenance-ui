import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { CONFIG_STALE_TIME, AUDIT_LOG_PAGE_SIZE, DEFAULT_API_LIMIT } from "@/lib/constants";
import type {
  Room, Department, Major, Level,
} from "@/types";
import type { EmailConfig } from "@/lib/api";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: api.getAdminStats });
}

export function useAuditLogs(page = 0, limit = AUDIT_LOG_PAGE_SIZE) {
  return useQuery({
    queryKey: ["admin", "audit-logs", page, limit],
    queryFn: () => api.getAuditLogs(page, limit),
  });
}

export function useRooms() {
  return useQuery({ queryKey: ["rooms"], queryFn: api.getRooms, staleTime: CONFIG_STALE_TIME });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, "id">) => api.createRoom(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"], refetchType: "active" }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Room, "id"> }) =>
      api.updateRoom(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"], refetchType: "active" }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"], refetchType: "active" }),
  });
}

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: api.getDepartments, staleTime: CONFIG_STALE_TIME });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Department, "id">) => api.createDepartment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"], refetchType: "active" }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Department, "id"> }) =>
      api.updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"], refetchType: "active" }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"], refetchType: "active" }),
  });
}

export function useMajors() {
  return useQuery({ queryKey: ["majors"], queryFn: api.getMajors, staleTime: CONFIG_STALE_TIME });
}

export function useCreateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Major, "id">) => api.createMajor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"], refetchType: "active" }),
  });
}

export function useUpdateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Major, "id"> }) =>
      api.updateMajor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"], refetchType: "active" }),
  });
}

export function useDeleteMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMajor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"], refetchType: "active" }),
  });
}

export function useLevels() {
  return useQuery({ queryKey: ["levels"], queryFn: api.getLevels, staleTime: CONFIG_STALE_TIME });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Level, "id">) => api.createLevel(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"], refetchType: "active" }),
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Level, "id"> }) =>
      api.updateLevel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"], refetchType: "active" }),
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteLevel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"], refetchType: "active" }),
  });
}

export function useJuryRoleTemplates() {
  return useQuery({ queryKey: ["jury-role-templates"], queryFn: api.getJuryRoleTemplates, staleTime: CONFIG_STALE_TIME });
}

export function useUsers(params: { role?: string; page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.getUsers(params),
  });
}

export function useStudents(params?: { page?: number; limit?: number; search?: string }) {
  const { page = 0, limit = DEFAULT_API_LIMIT, search } = params ?? {};
  return useQuery({
    queryKey: ["users", "students", page, limit, search],
    queryFn: () => api.getStudents(page, limit, search),
  });
}

export function useTeachers(params?: { page?: number; limit?: number; search?: string }) {
  const { page = 0, limit = DEFAULT_API_LIMIT, search } = params ?? {};
  return useQuery({
    queryKey: ["users", "teachers", page, limit, search],
    queryFn: () => api.getTeachers(page, limit, search),
  });
}

export function useCoordinators(params?: { page?: number; limit?: number; search?: string }) {
  const { page = 0, limit = DEFAULT_API_LIMIT, search } = params ?? {};
  return useQuery({
    queryKey: ["users", "coordinators", page, limit, search],
    queryFn: () => api.getCoordinators(page, limit, search),
  });
}

export function useTeachersList() {
  return useQuery({
    queryKey: ["users", "teachers", "list"],
    queryFn: () => api.getTeachersList(),
    staleTime: CONFIG_STALE_TIME,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UserCreateParams) => api.createUser(data),
    onSuccess: (user) => {
      const roleKey = user.role === "student" ? "students" : user.role === "teacher" ? "teachers" : "coordinators";
      qc.invalidateQueries({ queryKey: ["users", roleKey], refetchType: "active" });
      qc.invalidateQueries({ queryKey: ["users"], refetchType: "active" });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<api.UserCreateParams> }) =>
      api.updateUser(id, data),
    onSuccess: (user) => {
      const roleKey = user.role === "student" ? "students" : user.role === "teacher" ? "teachers" : "coordinators";
      qc.invalidateQueries({ queryKey: ["users", roleKey], refetchType: "active" });
      qc.invalidateQueries({ queryKey: ["users"], refetchType: "active" });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"], refetchType: "active" }),
  });
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["admin", "config", "general"],
    queryFn: api.getGeneralSettings,
    staleTime: CONFIG_STALE_TIME,
  });
}

export function useEmailConfig() {
  return useQuery({
    queryKey: ["admin", "config", "email"],
    queryFn: api.getEmailConfig,
    staleTime: CONFIG_STALE_TIME,
  });
}

export function useUpdateEmailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailConfig) => api.updateEmailConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config", "email"], refetchType: "active" }),
  });
}
