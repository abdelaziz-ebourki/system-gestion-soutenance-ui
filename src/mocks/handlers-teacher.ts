import { http, HttpResponse, delay } from "msw";
import type { TeacherStats, TeacherEvaluation } from "@/types";
import {
  MOCK_DELAY,
  getAllDefenseViews,
  getAllEvaluationViews,
  tblEvaluations, tblUnavailability,
  replaceTeacherUnavailability,
} from "./db";

export const teacherHandlers = [
  http.get("/api/teacher/stats", async () => {
    await delay(MOCK_DELAY);
    const evaluations = getAllEvaluationViews();
    const defenses = getAllDefenseViews();
    const pendingEvaluations = evaluations.filter((e) => e.status === "pending").length;
    const upcomingDefenses = defenses.filter((d) => d.status === "scheduled").length;
    const juryAssignments = defenses.filter((d) => d.role !== "supervisor").length;
    const declaredUnavailabilitySlots = tblUnavailability.reduce(
      (total, u) => total + u.slots.length, 0,
    );

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
    return HttpResponse.json(getAllDefenseViews());
  }),

  http.get("/api/teacher/evaluations", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(getAllEvaluationViews());
  }),

  http.post("/api/teacher/evaluations/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Pick<TeacherEvaluation, "score" | "comment">;
    const index = tblEvaluations.findIndex((e) => e.id === id);

    if (index === -1) return new HttpResponse(null, { status: 404 });

    tblEvaluations[index] = {
      ...tblEvaluations[index],
      score: body.score,
      comment: body.comment,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    };

    return HttpResponse.json(getAllEvaluationViews().find((e) => e.id === id));
  }),

  http.get("/api/teacher/unavailability", async () => {
    await delay(MOCK_DELAY);
    const slotsByDate: Record<string, string[]> = {};
    for (const u of tblUnavailability) {
      if (!slotsByDate[u.date]) slotsByDate[u.date] = [];
      slotsByDate[u.date].push(...u.slots);
    }
    return HttpResponse.json({ slotsByDate });
  }),

  http.post("/api/teacher/unavailability", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as { slotsByDate: Record<string, string[]> };
    replaceTeacherUnavailability(body);
    return HttpResponse.json(body);
  }),
];
