import { http, HttpResponse, delay } from "msw";
import type { TeacherStats, TeacherEvaluation, TeacherUnavailability } from "@/types";
import {
  MOCK_DELAY,
  teacherSchedule, teacherEvaluations, teacherUnavailability,
  replaceTeacherUnavailability,
} from "./data";

export const teacherHandlers = [
  http.get("/api/teacher/stats", async () => {
    await delay(MOCK_DELAY);
    const pendingEvaluations = teacherEvaluations.filter(
      (evaluation) => evaluation.status === "pending",
    ).length;
    const upcomingDefenses = teacherSchedule.filter(
      (defense) => defense.status === "scheduled",
    ).length;
    const juryAssignments = teacherSchedule.filter(
      (defense) => defense.role !== "supervisor",
    ).length;
    const declaredUnavailabilitySlots = Object.values(
      teacherUnavailability.slotsByDate,
    ).reduce((total, slots) => total + slots.length, 0);

    const stats: TeacherStats = {
      upcomingDefenses,
      pendingEvaluations,
      declaredUnavailabilitySlots,
      juryAssignments,
    };

    return HttpResponse.json(stats);
  }),

  http.get("/api/teacher/schedule", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(teacherSchedule);
  }),

  http.get("/api/teacher/evaluations", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(teacherEvaluations);
  }),

  http.post("/api/teacher/evaluations/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Pick<
      TeacherEvaluation,
      "score" | "comment"
    >;
    const index = teacherEvaluations.findIndex(
      (evaluation) => evaluation.id === id,
    );

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    teacherEvaluations[index] = {
      ...teacherEvaluations[index],
      ...body,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    };

    return HttpResponse.json(teacherEvaluations[index]);
  }),

  http.get("/api/teacher/unavailability", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(teacherUnavailability);
  }),

  http.post("/api/teacher/unavailability", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as TeacherUnavailability;
    replaceTeacherUnavailability(body);
    return HttpResponse.json(teacherUnavailability);
  }),
];
