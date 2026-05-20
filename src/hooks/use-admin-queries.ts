import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type {
  Session, Room, Department, Filiere, Level, Grade,
} from "@/types";
import type { DefenseSettings } from "@/lib/api";

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: api.getAdminStats });
}

export function useAuditLogs() {
  return useQuery({ queryKey: ["admin", "audit-logs"], queryFn: api.getAuditLogs });
}

export function useSessions() {
  return useQuery({ queryKey: ["sessions"], queryFn: api.getSessions });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Session, "id">) => api.createSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Session, "id"> }) =>
      api.updateSession(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
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

export function useFilieres() {
  return useQuery({ queryKey: ["filieres"], queryFn: api.getFilieres });
}

export function useCreateFiliere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Filiere, "id">) => api.createFiliere(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["filieres"] }),
  });
}

export function useUpdateFiliere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Filiere, "id"> }) =>
      api.updateFiliere(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["filieres"] }),
  });
}

export function useDeleteFiliere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFiliere(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["filieres"] }),
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

export function useGrades() {
  return useQuery({ queryKey: ["grades"], queryFn: api.getGrades });
}

export function useCreateGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Grade, "id">) => api.createGrade(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useUpdateGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Grade, "id"> }) =>
      api.updateGrade(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useDeleteGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGrade(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useDefenseSettings() {
  return useQuery({
    queryKey: ["defense-settings"],
    queryFn: api.getDefenseSettings,
  });
}

export function useUpdateDefenseSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DefenseSettings) => api.updateDefenseSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["defense-settings"] }),
  });
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

export function useStudentsList() {
  return useQuery({
    queryKey: ["users", "students", "list"],
    queryFn: api.getStudentsList,
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
