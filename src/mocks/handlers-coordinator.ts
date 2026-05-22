import { http, HttpResponse, delay } from "msw";
import {
  MOCK_DELAY,
  tblProjects, tblProjectStudents, tblDefenseSessions,
  tblJuries, tblGroups, tblGroupMembers,
  getProjectView, getAllProjectViews,
  getJuryView, getAllJuryViews,
  isDefenseSessionTransitionValid,
  prependProject, prependJury, removeJuryByProject,
} from "./db";
import type { SlotAssignment } from "@/lib/conflict-engine";

let tblSchedule: Record<string, SlotAssignment> = {};

export const coordinatorHandlers = [
  http.get("/api/coordinator/stats", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      totalProjects: tblProjects.length,
      totalGroups: tblGroups.length,
      totalJuries: tblJuries.length,
      scheduledDefenses: 6,
    });
  }),

  // ─── Projects ──────────────────────────────────────────────────

  http.get("/api/coordinator/projects", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(getAllProjectViews());
  }),

  http.post("/api/coordinator/projects", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Record<string, unknown>;
    const id = `p${tblProjects.length + 1}`;
    tblProjects.push({
      id,
      title: (body.title as string) ?? "",
      description: (body.description as string) ?? "",
      supervisorId: (body.supervisorId as string) ?? "",
      status: "pending",
    });
    const studentIds = (body.studentIds as string[]) ?? [];
    for (const studentId of studentIds) {
      tblProjectStudents.push({ projectId: id, studentId });
    }
    const project = tblProjects.find((p) => p.id === id)!;
    prependProject(getProjectView(project));
    return HttpResponse.json(getProjectView(project), { status: 201 });
  }),

  http.put("/api/coordinator/projects/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const index = tblProjects.findIndex((p) => p.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    if (body.title !== undefined) tblProjects[index].title = body.title as string;
    if (body.description !== undefined) tblProjects[index].description = body.description as string;
    if (body.supervisorId !== undefined) tblProjects[index].supervisorId = body.supervisorId as string;
    if (body.status !== undefined) tblProjects[index].status = body.status as typeof tblProjects[number]["status"];

    // Update project_students
    if (body.studentIds !== undefined) {
      const newIds = body.studentIds as string[];
      // Remove old
      for (let i = tblProjectStudents.length - 1; i >= 0; i--) {
        if (tblProjectStudents[i].projectId === id) {
          tblProjectStudents.splice(i, 1);
        }
      }
      // Add new
      for (const studentId of newIds) {
        tblProjectStudents.push({ projectId: id as string, studentId });
      }
    }

    return HttpResponse.json(getProjectView(tblProjects[index]));
  }),

  http.delete("/api/coordinator/projects/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblProjects.findIndex((p) => p.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblProjects.splice(index, 1);
    // Clean up project_students
    for (let i = tblProjectStudents.length - 1; i >= 0; i--) {
      if (tblProjectStudents[i].projectId === id) {
        tblProjectStudents.splice(i, 1);
      }
    }
    removeJuryByProject(id as string);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Juries ────────────────────────────────────────────────────

  http.get("/api/coordinator/juries", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(getAllJuryViews());
  }),

  http.post("/api/coordinator/juries", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Record<string, unknown>;
    const id = `j${tblJuries.length + 1}`;
    tblJuries.push({
      id,
      projectId: (body.projectId as string) ?? "",
      presidentId: (body.presidentId as string) ?? "",
      reporterId: (body.reporterId as string) ?? "",
      examinerId: (body.examinerId as string) ?? "",
    });
    const jury = tblJuries.find((j) => j.id === id)!;
    prependJury(getJuryView(jury));
    return HttpResponse.json(getJuryView(jury), { status: 201 });
  }),

  http.put("/api/coordinator/juries/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const index = tblJuries.findIndex((j) => j.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    if (body.projectId !== undefined) tblJuries[index].projectId = body.projectId as string;
    if (body.presidentId !== undefined) tblJuries[index].presidentId = body.presidentId as string;
    if (body.reporterId !== undefined) tblJuries[index].reporterId = body.reporterId as string;
    if (body.examinerId !== undefined) tblJuries[index].examinerId = body.examinerId as string;

    return HttpResponse.json(getJuryView(tblJuries[index]));
  }),

  http.delete("/api/coordinator/juries/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblJuries.findIndex((j) => j.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblJuries.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Groups ────────────────────────────────────────────────────

  http.get("/api/coordinator/groups", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblGroups.map((g) => ({
      id: g.id,
      projectId: g.projectId,
      studentIds: tblGroupMembers
        .filter((gm) => gm.groupId === g.id)
        .map((gm) => gm.studentId),
      sessionId: g.sessionId,
    })));
  }),

  http.post("/api/coordinator/groups", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Record<string, unknown>;
    const id = `g${tblGroups.length + 1}`;
    tblGroups.push({
      id,
      projectId: (body.projectId as string) ?? "",
      sessionId: (body.sessionId as string) ?? "",
    });
    const studentIds = (body.studentIds as string[]) ?? [];
    for (const studentId of studentIds) {
      tblGroupMembers.push({ groupId: id, studentId });
    }
    return HttpResponse.json({
      id, projectId: body.projectId, studentIds, sessionId: body.sessionId,
    }, { status: 201 });
  }),

  http.delete("/api/coordinator/groups/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblGroups.findIndex((g) => g.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblGroups.splice(index, 1);
    for (let i = tblGroupMembers.length - 1; i >= 0; i--) {
      if (tblGroupMembers[i].groupId === id) {
        tblGroupMembers.splice(i, 1);
      }
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Defense Sessions ─────────────────────────────────────────────

  http.get("/api/coordinator/defense-sessions", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblDefenseSessions);
  }),

  http.post("/api/coordinator/defense-sessions/:id/transition", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const { toStatus } = (await request.json()) as { toStatus: string };
    const index = tblDefenseSessions.findIndex((ds) => ds.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const from = tblDefenseSessions[index].status;
    if (!isDefenseSessionTransitionValid(from, toStatus)) {
      return HttpResponse.json(
        { message: `Transition invalide: ${from} → ${toStatus}` },
        { status: 400 },
      );
    }

    tblDefenseSessions[index] = {
      ...tblDefenseSessions[index],
      status: toStatus as typeof tblDefenseSessions[number]["status"],
    };
    return HttpResponse.json(tblDefenseSessions[index]);
  }),

  http.get("/api/coordinator/schedule", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblSchedule);
  }),

  http.post("/api/coordinator/schedule", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as { schedule: Record<string, SlotAssignment> };
    tblSchedule = body.schedule;
    return HttpResponse.json({ message: "Schedule saved successfully" });
  }),
];
