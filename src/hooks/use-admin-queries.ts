import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type {
  Room, Department, Major, Level,
} from "@/types";
import type { EmailConfig } from "@/lib/api";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: api.getAdminStats });
}

export function useAuditLogs() {
  return useQuery({ queryKey: ["admin", "audit-logs"], queryFn: api.getAuditLogs });
}

export function useRooms() {
  return useQuery({ queryKey: ["rooms"], queryFn: api.getRooms });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, "id">) => api.createRoom(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Room, "id"> }) =>
      api.updateRoom(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: api.getDepartments });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Department, "id">) => api.createDepartment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Department, "id"> }) =>
      api.updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useMajors() {
  return useQuery({ queryKey: ["majors"], queryFn: api.getMajors });
}

export function useCreateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Major, "id">) => api.createMajor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"] }),
  });
}

export function useUpdateMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Major, "id"> }) =>
      api.updateMajor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"] }),
  });
}

export function useDeleteMajor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMajor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["majors"] }),
  });
}

export function useLevels() {
  return useQuery({ queryKey: ["levels"], queryFn: api.getLevels });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Level, "id">) => api.createLevel(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Level, "id"> }) =>
      api.updateLevel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteLevel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["levels"] }),
  });
}

export function useJuryRoleTemplates() {
  return useQuery({ queryKey: ["jury-role-templates"], queryFn: api.getJuryRoleTemplates });
}

export function useUsers(params: { role?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.getUsers(params),
  });
}

export function useStudents(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["users", "students", page, limit],
    queryFn: () => api.getStudents(page, limit),
  });
}

export function useTeachers(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["users", "teachers", page, limit],
    queryFn: () => api.getTeachers(page, limit),
  });
}

export function useCoordinators(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["users", "coordinators", page, limit],
    queryFn: () => api.getCoordinators(page, limit),
  });
}

export function useTeachersList() {
  return useQuery({
    queryKey: ["users", "teachers", "list"],
    queryFn: api.getTeachersList,
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UserCreateParams) => api.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<api.UserCreateParams> }) =>
      api.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["admin", "config", "general"],
    queryFn: api.getGeneralSettings,
  });
}

export function useEmailConfig() {
  return useQuery({
    queryKey: ["admin", "config", "email"],
    queryFn: api.getEmailConfig,
  });
}

export function useUpdateEmailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailConfig) => api.updateEmailConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config", "email"] }),
  });
}
