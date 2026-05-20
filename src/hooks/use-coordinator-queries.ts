import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import type { Project, Group, Jury } from "@/types";

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
