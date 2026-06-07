import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { TeacherEvaluation, TeacherUnavailability } from "@/types";

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
      qc.invalidateQueries({ queryKey: ["teacher", "evaluations"], refetchType: "active" }),
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
      qc.invalidateQueries({ queryKey: ["teacher", "unavailability"], refetchType: "active" }),
  });
}
