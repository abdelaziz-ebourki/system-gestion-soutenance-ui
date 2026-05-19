import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import type {
  Session, Room, Department, Filiere, Level, Grade,
  User, Student, Teacher, Coordinator,
  Project, Group, Jury,
  DefenseSettings, DashboardStats,
} from "@/types";
import type { AuditLog } from "@/types/audit-log";
import type {
  CoordinatorStats,
  TeacherStats, TeacherDefense, TeacherEvaluation, TeacherUnavailability,
  StudentStats, StudentDefenseDetails, StudentDocument,
  StudentGroupWorkspace, StudentGroupDetails,
} from "@/lib/api";

// === Admin ===

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: api.getAdminStats });
}

export function useAuditLogs() {
  return useQuery({ queryKey: ["admin", "audit-logs"], queryFn: api.getAuditLogs });
}

// --- Sessions ---

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

// --- Rooms ---

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

// --- Departments ---

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

// --- Configuration (Filieres, Levels, Grades) ---

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

// --- Defense Settings ---

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

// --- Users ---

export function useUsers(params: { role?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.getUsers(params),
  });
}

export function useStudents(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["students", page, limit],
    queryFn: () => api.getStudents(page, limit),
  });
}

export function useTeachers(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["teachers", page, limit],
    queryFn: () => api.getTeachers(page, limit),
  });
}

export function useCoordinators(page = 0, limit = 10) {
  return useQuery({
    queryKey: ["coordinators", page, limit],
    queryFn: () => api.getCoordinators(page, limit),
  });
}

export function useTeachersList() {
  return useQuery({
    queryKey: ["teachers", "list"],
    queryFn: api.getTeachersList,
    staleTime: 60_000,
  });
}

export function useStudentsList() {
  return useQuery({
    queryKey: ["students", "list"],
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

// === Coordinator ===

export function useCoordinatorStats() {
  return useQuery({
    queryKey: ["coordinator", "stats"],
    queryFn: api.getCoordinatorStats,
  });
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Project, "id">) => api.createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api.updateProject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useJurys() {
  return useQuery({ queryKey: ["jurys"], queryFn: api.getJurys });
}

export function useCreateJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Jury, "id">) => api.createJury(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jurys"] }),
  });
}

export function useUpdateJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Jury> }) =>
      api.updateJury(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jurys"] }),
  });
}

export function useDeleteJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJury(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jurys"] }),
  });
}

export function useGroups() {
  return useQuery({ queryKey: ["groups"], queryFn: api.getGroups });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Group, "id">) => api.createGroup(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useSaveSoutenanceSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: Record<string, { id: string; title: string }>) =>
      api.saveSoutenanceSchedule(schedule),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coordinator", "stats"] });
    },
  });
}

// === Teacher ===

export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher", "stats"],
    queryFn: api.getTeacherStats,
  });
}

export function useTeacherSchedule() {
  return useQuery({
    queryKey: ["teacher", "schedule"],
    queryFn: api.getTeacherSchedule,
  });
}

export function useTeacherEvaluations() {
  return useQuery({
    queryKey: ["teacher", "evaluations"],
    queryFn: api.getTeacherEvaluations,
  });
}

export function useSubmitTeacherEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Pick<TeacherEvaluation, "score" | "comment">;
    }) => api.submitTeacherEvaluation(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["teacher", "evaluations"] }),
  });
}

export function useTeacherUnavailability() {
  return useQuery({
    queryKey: ["teacher", "unavailability"],
    queryFn: api.getTeacherUnavailability,
  });
}

export function useSaveTeacherUnavailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherUnavailability) =>
      api.saveTeacherUnavailability(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["teacher", "unavailability"] }),
  });
}

// === Student ===

export function useStudentStats() {
  return useQuery({
    queryKey: ["student", "stats"],
    queryFn: api.getStudentStats,
  });
}

export function useStudentDefense() {
  return useQuery({
    queryKey: ["student", "defense"],
    queryFn: api.getStudentDefense,
  });
}

export function useStudentGroup() {
  return useQuery({
    queryKey: ["student", "group"],
    queryFn: api.getStudentGroup,
  });
}

export function useCreateStudentGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.createStudentGroup(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student", "group"] }),
  });
}

export function useJoinStudentGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => api.joinStudentGroup(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student", "group"] }),
  });
}

export function useStudentDocuments() {
  return useQuery({
    queryKey: ["student", "documents"],
    queryFn: api.getStudentDocuments,
  });
}
