import { api } from "./api-core";
import type { Project, Group, Jury, DefenseSession, DefenseSessionStatus } from "@/types";
import type { SlotAssignment } from "@/lib/conflict-engine";

export interface CoordinatorStats {
  totalProjects: number;
  totalGroups: number;
  totalJuries: number;
  scheduledDefenses: number;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  supervisorId: string;
  studentIds?: string[];
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  supervisorId?: string;
  studentIds?: string[];
  status?: "pending" | "approved" | "rejected";
}

export interface JuryMemberPayload {
  roleName: string;
  teacherId: string;
}

export interface CreateJuryPayload {
  projectId: string;
  templateId: string;
  members: JuryMemberPayload[];
}

export interface UpdateJuryPayload {
  projectId?: string;
  templateId?: string;
  members?: JuryMemberPayload[];
}

export const getCoordinatorStats = () =>
  api<CoordinatorStats>("/coordinator/stats");

export const getProjects = () => api<Project[]>("/coordinator/projects");
export const createProject = (data: CreateProjectPayload) =>
  api<Project>("/coordinator/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateProject = (id: string, data: UpdateProjectPayload) =>
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

export const getJuries = () => api<Jury[]>("/coordinator/juries");
export const createJury = (data: CreateJuryPayload) =>
  api<Jury>("/coordinator/juries", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateJury = (id: string, data: UpdateJuryPayload) =>
  api<Jury>(`/coordinator/juries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteJury = (id: string) =>
  api<void>(`/coordinator/juries/${id}`, { method: "DELETE" });

export const getCoordinatorDefenseSessions = () =>
  api<DefenseSession[]>("/coordinator/defense-sessions");

export const transitionDefenseSession = (id: string, toStatus: DefenseSessionStatus) =>
  api<DefenseSession>(`/coordinator/defense-sessions/${id}/transition`, {
    method: "POST",
    body: JSON.stringify({ toStatus }),
  });

export const getDefenseSchedule = () =>
  api<Record<string, SlotAssignment>>("/coordinator/schedule");

export const saveDefenseSchedule = (
  schedule: Record<string, SlotAssignment>,
) =>
  api<void>("/coordinator/schedule", {
    method: "POST",
    body: JSON.stringify({ schedule }),
  });

export interface UnavailabilityEntry {
  id: string;
  teacherId: string;
  date: string;
  slots: string[];
}

export const getCoordinatorUnavailability = () =>
  api<UnavailabilityEntry[]>("/coordinator/unavailability");

export interface StudentGroupAssignment {
  id: string;
  groupName: string;
  memberNames: string[];
  memberCount: number;
  projectId: string | null;
  projectTitle?: string;
}

export const getStudentGroups = () =>
  api<StudentGroupAssignment[]>("/coordinator/student-groups");

export const assignProjectToGroup = (projectId: string, groupId: string) =>
  api<Project>(`/coordinator/projects/${projectId}/assign-group`, {
    method: "POST",
    body: JSON.stringify({ groupId }),
  });
