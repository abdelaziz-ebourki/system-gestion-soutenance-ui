import { http, HttpResponse, delay } from "msw";
import {
  MOCK_DELAY,
  tblProjects, tblProjectStudents, tblDefenseSessions,
  tblJuries, tblGroups, tblGroupMembers, tblDefenses,
  tblUnavailability, tblStudentGroups,
  tblDefenseTeachers, tblEvaluations,
  tblRooms,
  getProjectView, getAllProjectViews,
  getJuryView, getAllJuryViews,
  isDefenseSessionTransitionValid,
  prependProject, removeJuryByProject,
  getUserFullName, getDefenseGrade,
  createNotification, generateAutoSchedule,
  tblUsers, tblGeneralSettings,
} from "./db";
import type { SlotAssignment } from "@/lib/conflict-engine";
import type { DbProject, DbJury } from "./db/schema";

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
      defenseType: (body.defenseType as DbProject["defenseType"]) ?? "pfe",
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
    if (body.defenseType !== undefined) tblProjects[index].defenseType = body.defenseType as DbProject["defenseType"];

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

    const nbJuries = tblJuries.filter((j) => j.projectId === id).length;
    const nbGroups = tblGroups.filter((g) => g.projectId === id).length;
    const nbDefenses = tblDefenses.filter((d) => d.projectId === id).length;
    const parts: string[] = [];
    if (nbJuries > 0) parts.push(`${nbJuries} jury(s)`);
    if (nbGroups > 0) parts.push(`${nbGroups} groupe(s)`);
    if (nbDefenses > 0) parts.push(`${nbDefenses} soutenance(s)`);
    if (parts.length > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer ce projet : ${parts.join(", ")} lui sont associé(e)s.` },
        { status: 409 },
      );
    }

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
    const body = (await request.json()) as Omit<DbJury, "id">;
    const id = `j${tblJuries.length + 1}`;
    const newJury: DbJury = {
      id,
      projectId: body.projectId,
      templateId: body.templateId,
      members: body.members,
    };
    tblJuries.push(newJury);
    return HttpResponse.json(getJuryView(newJury), { status: 201 });
  }),

  http.put("/api/coordinator/juries/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Partial<Omit<DbJury, "id">>;
    const index = tblJuries.findIndex((j) => j.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    if (body.projectId !== undefined) tblJuries[index].projectId = body.projectId;
    if (body.templateId !== undefined) tblJuries[index].templateId = body.templateId;
    if (body.members !== undefined) tblJuries[index].members = body.members;

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

  http.get("/api/coordinator/unavailability", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblUnavailability);
  }),

  // ─── Student Groups (for project assignment) ─────────────────────

  http.get("/api/coordinator/student-groups", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblStudentGroups.map((sg) => {
      const project = sg.projectId
        ? tblProjects.find((p) => p.id === sg.projectId)
        : undefined;
      return {
        id: sg.id,
        groupName: sg.groupName,
        memberNames: sg.memberIds.map(getUserFullName),
        memberCount: sg.memberIds.length,
        projectId: sg.projectId,
        projectTitle: project?.title ?? undefined,
      };
    }));
  }),

  http.post("/api/coordinator/projects/:id/assign-group", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const { groupId } = (await request.json()) as { groupId: string };
    const projectIndex = tblProjects.findIndex((p) => p.id === id);
    if (projectIndex === -1) return new HttpResponse(null, { status: 404 });
    const group = tblStudentGroups.find((g) => g.id === groupId);
    if (!group) return new HttpResponse(null, { status: 404 });
    if (group.projectId) {
      return HttpResponse.json(
        { message: "Ce groupe a déjà un projet assigné." },
        { status: 400 },
      );
    }

    group.projectId = id;
    const memberIds = group.memberIds;
    for (const studentId of memberIds) {
      tblProjectStudents.push({ projectId: id, studentId });
    }
    tblProjects[projectIndex].status = "approved";

    return HttpResponse.json(getProjectView(tblProjects[projectIndex]));
  }),

  // ─── Grades ─────────────────────────────────────────────────────

  http.get("/api/coordinator/grades", async () => {
    await delay(MOCK_DELAY);
    const grades = tblJuries.map((jury) => {
      const project = tblProjects.find((p) => p.id === jury.projectId);
      const defense = tblDefenses.find((d) => d.projectId === jury.projectId);
      const gradeResult = defense ? getDefenseGrade(defense.id) : null;
      const evaluations = defense
        ? tblEvaluations.filter((e) => e.defenseId === defense.id)
        : [];
      return {
        projectId: jury.projectId,
        projectTitle: project?.title ?? "",
        defenseDate: defense?.date ?? null,
        status: (evaluations.length > 0 && evaluations.every((e) => e.status === "submitted")
          ? "completed"
          : evaluations.length === 0
            ? "no_evaluations"
            : "pending") as "completed" | "pending" | "no_evaluations",
        finalScore: gradeResult?.finalScore ?? null,
        evaluationCoefficients: gradeResult?.evaluationCoefficients ?? {},
        individualScores: gradeResult?.individualScores ?? [],
      };
    });
    return HttpResponse.json(grades);
  }),

  // ─── Auto-generate Schedule ───────────────────────────────────────

  http.post("/api/coordinator/schedule/auto-generate", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { defenseSessionId } = (await request.json()) as { defenseSessionId: string };
    const schedule = generateAutoSchedule(defenseSessionId);
    return HttpResponse.json({ schedule });
  }),

  // ─── Publish Schedule ──────────────────────────────────────────────

  http.post("/api/coordinator/schedule/publish", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { defenseSessionId } = (await request.json()) as { defenseSessionId: string };
    const session = tblDefenseSessions.find((s) => s.id === defenseSessionId);
    if (!session) {
      return HttpResponse.json({ message: "Session introuvable." }, { status: 404 });
    }

    const existing = Object.keys(tblSchedule);
    if (existing.length === 0) {
      return HttpResponse.json({ message: "Aucun créneau à publier." }, { status: 400 });
    }

    let publishedCount = 0;
    for (const [slotKey, assignment] of Object.entries(tblSchedule)) {
      const [date, roomId, time] = slotKey.split("|");
      const project = tblProjects.find((p) => p.id === assignment.id);
      if (!project) continue;

      const startMinutes = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
      const endMinutes = startMinutes + (session.defenseDuration || 30);
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      const defenseId = `def${tblDefenses.length + 1}`;
      tblDefenses.push({
        id: defenseId,
        projectId: project.id,
        defenseType: project.defenseType,
        date,
        startTime: time,
        endTime,
        roomId,
        status: "scheduled",
      });

      // Link jury teachers
      const jury = tblJuries.find((j) => j.projectId === project.id);
      if (jury) {
        for (const member of jury.members) {
          tblDefenseTeachers.push({ defenseId, teacherId: member.teacherId, role: member.roleName });
        }
      }

      // Notify teacher
      const teacher = tblUsers.find((u) => u.id === project.supervisorId);
      if (teacher) {
        createNotification({
          title: "Soutenance programmée",
          message: `La soutenance de "${project.title}" est programmée le ${date} à ${time}.`,
          actionLink: "/coordinator/schedule",
          actor: "system",
        });
      }

      publishedCount++;
    }

    // Transition session to scheduled
    if (session.status === "active") {
      session.status = "scheduled";
    }

    tblSchedule = {};
    return HttpResponse.json({ message: `${publishedCount} soutenance(s) publiée(s).`, count: publishedCount });
  }),

  // ─── Cancel Defense ────────────────────────────────────────────────

  http.post("/api/coordinator/defenses/:id/cancel", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;

    // Remove from tblSchedule if present
    let removedFromSchedule = false;
    for (const [key, assignment] of Object.entries(tblSchedule)) {
      if (assignment.id === id) {
        delete tblSchedule[key];
        removedFromSchedule = true;
        break;
      }
    }

    // Cancel in tblDefenses if present
    const defense = tblDefenses.find((d) => d.projectId === id);
    if (defense) {
      defense.status = "cancelled";

      // Remove linked defense teachers
      for (let i = tblDefenseTeachers.length - 1; i >= 0; i--) {
        if (tblDefenseTeachers[i].defenseId === defense.id) {
          tblDefenseTeachers.splice(i, 1);
        }
      }

      createNotification({
        title: "Soutenance annulée",
        message: `La soutenance du projet "${tblProjects.find((p) => p.id === id)?.title ?? id}" a été annulée.`,
        actionLink: "/coordinator/schedule",
        actor: "system",
      });
    }

    if (!removedFromSchedule && !defense) {
      return HttpResponse.json({ message: "Soutenance introuvable." }, { status: 404 });
    }

    return HttpResponse.json({ message: "Soutenance annulée." });
  }),

  // ─── Document data endpoints ──────────────────────────────────────

  http.get("/api/coordinator/document-data/evaluation-sheet", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new HttpResponse(null, { status: 400 });

    const project = tblProjects.find((p) => p.id === projectId);
    const projectView = project ? getProjectView(project) : null;
    const grade = tblJuries
      .filter((j) => j.projectId === projectId)
      .map((jury) => {
        const defense = tblDefenses.find((d) => d.projectId === jury.projectId);
        const gradeResult = defense ? getDefenseGrade(defense.id) : null;
        const evaluations = defense ? tblEvaluations.filter((e) => e.defenseId === defense.id) : [];
        return {
          projectId: jury.projectId,
          projectTitle: projectView?.title ?? "",
          defenseDate: defense?.date ?? null,
          status: (evaluations.length > 0 && evaluations.every((e) => e.status === "submitted") ? "completed" : evaluations.length === 0 ? "no_evaluations" : "pending") as "completed" | "pending" | "no_evaluations",
          finalScore: gradeResult?.finalScore ?? null,
          evaluationCoefficients: gradeResult?.evaluationCoefficients ?? {},
          individualScores: gradeResult?.individualScores ?? [],
        };
      })[0] ?? null;

    return HttpResponse.json({
      settings: { ...tblGeneralSettings },
      grade,
      studentNames: projectView?.studentNames ?? [],
    });
  }),

  http.get("/api/coordinator/document-data/attendance-list", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const sessionId = url.searchParams.get("sessionId");
    if (!date) return new HttpResponse(null, { status: 400 });

    const session = sessionId ? tblDefenseSessions.find((s) => s.id === sessionId) : undefined;
    const defensesOnDate = tblDefenses.filter((d) => d.date === date && d.status !== "cancelled");
    const slots = defensesOnDate.map((d) => {
      const pv = getProjectView(tblProjects.find((p) => p.id === d.projectId)!);
      const jury = tblJuries.find((j) => j.projectId === d.projectId);
      return {
        time: `${d.startTime} — ${d.endTime}`,
        project: { title: pv?.title ?? "", students: pv?.studentNames ?? [] },
        jury: jury?.members.map((m) => `${m.roleName}: ${getUserFullName(m.teacherId)}`).join(" | ") ?? "",
        supervisor: pv?.supervisorName ?? "",
      };
    });
    slots.sort((a, b) => a.time.localeCompare(b.time));

    return HttpResponse.json({
      settings: { ...tblGeneralSettings },
      sessionName: session?.name ?? "",
      date,
      slots,
    });
  }),

  http.get("/api/coordinator/document-data/jury-convocation", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const teacherId = url.searchParams.get("teacherId");
    if (!projectId || !teacherId) return new HttpResponse(null, { status: 400 });

    const defense = tblDefenses.find((d) => d.projectId === projectId);
    const pv = getProjectView(tblProjects.find((p) => p.id === projectId)!);
    const jury = tblJuries.find((j) => j.projectId === projectId);
    const member = jury?.members.find((m) => m.teacherId === teacherId);
    const president = jury?.members.find((m) => m.roleName === "Président");

    return HttpResponse.json({
      settings: { ...tblGeneralSettings },
      projectTitle: pv?.title ?? "",
      studentNames: pv?.studentNames ?? [],
      supervisorName: pv?.supervisorName ?? "",
      date: defense?.date ?? "",
      startTime: defense?.startTime ?? "",
      endTime: defense?.endTime ?? "",
      roomName: tblRooms.find((r) => r.id === defense?.roomId)?.name ?? "",
      role: member?.roleName ?? "",
      juryPresident: president ? getUserFullName(president.teacherId) : "",
      teacherName: getUserFullName(teacherId),
    });
  }),

  http.get("/api/coordinator/document-data/schedule", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    const session = sessionId ? tblDefenseSessions.find((s) => s.id === sessionId) : undefined;

    const defenses = tblDefenses.filter((d) => d.status !== "cancelled");
    const dates = [...new Set(defenses.map((d) => d.date))].sort();
    const days = dates.map((date) => {
      const dayDefenses = defenses.filter((d) => d.date === date);
      const slots = dayDefenses.map((d) => {
        const pv = getProjectView(tblProjects.find((p) => p.id === d.projectId)!);
        const jury = tblJuries.find((j) => j.projectId === d.projectId);
        return {
          time: `${d.startTime} — ${d.endTime}`,
          projectTitle: pv?.title ?? "",
          students: pv?.studentNames ?? [],
          roomName: tblRooms.find((r) => r.id === d.roomId)?.name ?? "",
          jury: jury?.members.map((m) => `${m.roleName}: ${getUserFullName(m.teacherId)}`).join(" | ") ?? "",
        };
      });
      slots.sort((a, b) => a.time.localeCompare(b.time));
      return { date, slots };
    });

    return HttpResponse.json({
      settings: { ...tblGeneralSettings },
      sessionName: session?.name ?? "",
      days,
    });
  }),

  http.get("/api/coordinator/document-data/proces-verbal", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new HttpResponse(null, { status: 400 });

    const defense = tblDefenses.find((d) => d.projectId === projectId);
    const pv = getProjectView(tblProjects.find((p) => p.id === projectId)!);
    const jury = tblJuries.find((j) => j.projectId === projectId);
    const grade = tblJuries
      .filter((j) => j.projectId === projectId)
      .map((jury) => {
        const d = tblDefenses.find((def) => def.projectId === jury.projectId);
        const gradeResult = d ? getDefenseGrade(d.id) : null;
        const evaluations = d ? tblEvaluations.filter((e) => e.defenseId === d.id) : [];
        return {
          projectId: jury.projectId,
          projectTitle: pv?.title ?? "",
          defenseDate: d?.date ?? null,
          status: (evaluations.length > 0 && evaluations.every((e) => e.status === "submitted") ? "completed" : evaluations.length === 0 ? "no_evaluations" : "pending") as "completed" | "pending" | "no_evaluations",
          finalScore: gradeResult?.finalScore ?? null,
          evaluationCoefficients: gradeResult?.evaluationCoefficients ?? {},
          individualScores: gradeResult?.individualScores ?? [],
        };
      })[0] ?? null;

    return HttpResponse.json({
      settings: { ...tblGeneralSettings },
      grade,
      studentNames: pv?.studentNames ?? [],
      supervisorName: pv?.supervisorName ?? "",
      juryMembers: jury?.members.map((m) => ({ roleName: m.roleName, teacherName: getUserFullName(m.teacherId) })) ?? [],
    });
  }),
];
