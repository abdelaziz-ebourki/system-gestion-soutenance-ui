import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type {
  Session, Room, Department, Major, Level, Grade, DefenseSession, JuryRoleTemplate,
} from "@/types";
import type { DefenseSettings, GeneralSettings, DefenseTypeConfig, DocumentConfig } from "@/lib/api";

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

export function useGradeLevels() {
  return useQuery({ queryKey: ["grades"], queryFn: api.getGradeLevels });
}

export function useCreateGradeLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Grade, "id">) => api.createGradeLevel(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useUpdateGradeLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Grade, "id"> }) => api.updateGradeLevel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useDeleteGradeLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGradeLevel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}


export function useDefenseSettings() {
  return useQuery({
    queryKey: ["defense-settings"],
    queryFn: api.getDefenseSettings,
  });
}

export function useJuryRoleTemplates() {
  return useQuery({ queryKey: ["jury-role-templates"], queryFn: api.getJuryRoleTemplates });
}

export function useCreateJuryRoleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<JuryRoleTemplate, "id">) => api.createJuryRoleTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jury-role-templates"] }),
  });
}

export function useUpdateJuryRoleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<JuryRoleTemplate, "id"> }) =>
      api.updateJuryRoleTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jury-role-templates"] }),
  });
}

export function useDeleteJuryRoleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJuryRoleTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jury-role-templates"] }),
  });
}

export function useDefenseSessions() {
  return useQuery({ queryKey: ["defense-sessions"], queryFn: api.getDefenseSessions });
}

export function useCreateDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DefenseSession, "id">) => api.createDefenseSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["defense-sessions"] }),
  });
}

export function useUpdateDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<DefenseSession, "id"> }) =>
      api.updateDefenseSession(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["defense-sessions"] }),
  });
}

export function useDeleteDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDefenseSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["defense-sessions"] }),
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

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["admin", "config", "general"],
    queryFn: api.getGeneralSettings,
  });
}

export function useUpdateGeneralSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GeneralSettings) => api.updateGeneralSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config", "general"] }),
  });
}

export function useDefenseTypeConfig() {
  return useQuery({
    queryKey: ["admin", "config", "defense-types"],
    queryFn: api.getDefenseTypeConfig,
  });
}

export function useUpdateDefenseTypeConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DefenseTypeConfig) => api.updateDefenseTypeConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config", "defense-types"] }),
  });
}

export function useDocumentConfig() {
  return useQuery({
    queryKey: ["admin", "config", "documents"],
    queryFn: api.getDocumentConfig,
  });
}

export function useUpdateDocumentConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DocumentConfig) => api.updateDocumentConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "config", "documents"] }),
  });
}
