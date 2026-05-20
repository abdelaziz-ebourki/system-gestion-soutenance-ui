import { api } from "./api-core";
import type { Project, Group, Jury } from "@/types";

export interface CoordinatorStats {
  totalProjects: number;
  totalGroups: number;
  totalJuries: number;
  scheduledDefenses: number;
}

export const getCoordinatorStats = () =>
  api<CoordinatorStats>("/coordinator/stats");

export const getProjects = () => api<Project[]>("/coordinator/projects");
export const createProject = (data: Omit<Project, "id">) =>
  api<Project>("/coordinator/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateProject = (id: string, data: Partial<Project>) =>
  api<Project>(`/coordinator/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteProject = (id: string) =>
  api<void>(`/coordinator/projects/${id}`, { method: "DELETE" });

export const getGroups = () => api<Group[]>("/coordinator/groups");
export const createGroup = (data: Omit<Group, "id">) =>
  api<Group>("/coordinator/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteGroup = (id: string) =>
  api<void>(`/coordinator/groups/${id}`, { method: "DELETE" });

export const getJurys = () => api<Jury[]>("/coordinator/jurys");
export const createJury = (data: Omit<Jury, "id">) =>
  api<Jury>("/coordinator/jurys", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateJury = (id: string, data: Partial<Jury>) =>
  api<Jury>(`/coordinator/jurys/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteJury = (id: string) =>
  api<void>(`/coordinator/jurys/${id}`, { method: "DELETE" });

export const saveSoutenanceSchedule = (
  schedule: Record<string, { id: string; title: string }>,
) =>
  api<void>("/coordinator/schedule", {
    method: "POST",
    body: JSON.stringify({ schedule }),
  });
