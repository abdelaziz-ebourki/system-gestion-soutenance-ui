import { api } from "./api-core";
import type {
  StudentStats, StudentDefenseDetails, StudentGroupWorkspace,
  StudentGroupDetails, StudentDocument,
} from "@/types";

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
  api<Blob>("/student/convocation", { responseType: "blob" });

export const uploadStudentDocument = (documentId: string, _file: File) =>
  api<StudentDocument>(`/student/documents/${documentId}/upload`, {
    method: "POST",
  });
