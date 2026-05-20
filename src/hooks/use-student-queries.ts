import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";

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
