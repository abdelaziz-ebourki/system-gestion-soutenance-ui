import { api } from "./api-core";
import type {
  StudentStats, StudentDefenseDetails, StudentGroupWorkspace,
  StudentGroupDetails, StudentDocument,
} from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

export const getStudentStats = () => api<StudentStats>("/student/stats");

export const getStudentDefense = () =>
  api<StudentDefenseDetails>("/student/defense");

export const getStudentGroup = () =>
  api<StudentGroupWorkspace>("/student/group");

export const getStudentDocuments = () =>
  api<StudentDocument[]>("/student/documents");

export const createStudentGroup = () =>
  api<StudentGroupDetails>("/student/group", {
    method: "POST",
  });

export const joinStudentGroup = (groupId: string) =>
  api<StudentGroupDetails>(`/student/group/${groupId}/join`, {
    method: "POST",
  });

export const getStudentConvocation = () =>
  fetch("/api/student/convocation", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || "Impossible de telecharger la convocation",
      );
    }
    return response.blob();
  });
