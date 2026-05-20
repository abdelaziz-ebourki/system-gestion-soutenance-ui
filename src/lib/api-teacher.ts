import { api } from "./api-core";
import type {
  TeacherStats, TeacherDefense, TeacherEvaluation, TeacherUnavailability,
} from "@/types";

export const getTeacherStats = () => api<TeacherStats>("/teacher/stats");

export const getTeacherSchedule = () =>
  api<TeacherDefense[]>("/teacher/schedule");

export const getTeacherEvaluations = () =>
  api<TeacherEvaluation[]>("/teacher/evaluations");

export const submitTeacherEvaluation = (
  id: string,
  data: Pick<TeacherEvaluation, "score" | "comment">,
) =>
  api<TeacherEvaluation>(`/teacher/evaluations/${id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getTeacherUnavailability = () =>
  api<TeacherUnavailability>("/teacher/unavailability");

export const saveTeacherUnavailability = (data: TeacherUnavailability) =>
  api<TeacherUnavailability>("/teacher/unavailability", {
    method: "POST",
    body: JSON.stringify(data),
  });
