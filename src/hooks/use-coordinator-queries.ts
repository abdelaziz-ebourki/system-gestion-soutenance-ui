import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { Group, DefenseSessionStatus } from "@/types";
import type { CreateProjectPayload, UpdateProjectPayload, CreateJuryPayload, UpdateJuryPayload, CreateDefenseSessionPayload } from "@/lib/api-coordinator";
import type { SlotAssignment } from "@/lib/conflict-engine";

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
    mutationFn: (data: CreateProjectPayload) => api.createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
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

export function useJuries() {
  return useQuery({ queryKey: ["juries"], queryFn: api.getJuries });
}

export function useCreateJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJuryPayload) => api.createJury(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["juries"] }),
  });
}

export function useUpdateJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJuryPayload }) =>
      api.updateJury(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["juries"] }),
  });
}

export function useDeleteJury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJury(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["juries"] }),
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

export function useCoordinatorDefenseSessions() {
  return useQuery({
    queryKey: ["coordinator", "defense-sessions"],
    queryFn: api.getCoordinatorDefenseSessions,
  });
}

export function useCreateDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDefenseSessionPayload) => api.createCoordinatorDefenseSession(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coordinator", "defense-sessions"] }),
  });
}

export function useUpdateDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDefenseSessionPayload }) =>
      api.updateCoordinatorDefenseSession(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coordinator", "defense-sessions"] }),
  });
}

export function useDeleteDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCoordinatorDefenseSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coordinator", "defense-sessions"] }),
  });
}

export function useTransitionDefenseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toStatus }: { id: string; toStatus: DefenseSessionStatus }) =>
      api.transitionDefenseSession(id, toStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coordinator", "defense-sessions"] });
    },
  });
}

export function useDefenseSchedule() {
  return useQuery({
    queryKey: ["coordinator", "schedule"],
    queryFn: api.getDefenseSchedule,
  });
}

export function useSaveDefenseSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schedule: Record<string, SlotAssignment>) =>
      api.saveDefenseSchedule(schedule),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coordinator", "stats"] });
      qc.invalidateQueries({ queryKey: ["coordinator", "schedule"] });
    },
  });
}

export function useCoordinatorUnavailability() {
  return useQuery({
    queryKey: ["coordinator", "unavailability"],
    queryFn: api.getCoordinatorUnavailability,
  });
}

export function useStudentGroups() {
  return useQuery({
    queryKey: ["coordinator", "student-groups"],
    queryFn: api.getStudentGroups,
  });
}

export function useProjectGrades() {
  return useQuery({
    queryKey: ["coordinator", "grades"],
    queryFn: () => api.getGrades(),
  });
}

export function useAssignProjectToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, groupId }: { projectId: string; groupId: string }) =>
      api.assignProjectToGroup(projectId, groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["coordinator", "student-groups"] });
    },
  });
}

// --- Document generation hooks ---

export function useEvaluationSheet(projectId: string | null) {
  return useQuery({
    queryKey: ["coordinator", "documents", "evaluation-sheet", projectId],
    queryFn: () => api.getEvaluationSheet(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useAttendanceList(defenseSessionId: string | null) {
  return useQuery({
    queryKey: ["coordinator", "documents", "attendance-list", defenseSessionId],
    queryFn: () => api.getAttendanceList(defenseSessionId!),
    enabled: !!defenseSessionId,
    staleTime: 60_000,
  });
}

export function useJuryConvocations(projectId: string | null) {
  return useQuery({
    queryKey: ["coordinator", "documents", "jury-convocations", projectId],
    queryFn: () => api.getJuryConvocations(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

export function useDefenseScheduleDoc(defenseSessionId: string | null) {
  return useQuery({
    queryKey: ["coordinator", "documents", "schedule", defenseSessionId],
    queryFn: () => api.getDefenseScheduleDoc(defenseSessionId!),
    enabled: !!defenseSessionId,
    staleTime: 60_000,
  });
}

export function useProcesVerbal(projectId: string | null) {
  return useQuery({
    queryKey: ["coordinator", "documents", "proces-verbal", projectId],
    queryFn: () => api.getProcesVerbal(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
