import { http, HttpResponse, delay } from "msw";
import type { Teacher, Coordinator, Department, Session, Room, Major, Level, Grade, Student, DefenseSession } from "@/types";
import {
  MOCK_DELAY,
  tblUsers, tblStudents, tblTeachers, tblCoordinators,
  tblDepartments, tblSessions, tblRooms, tblDefenseSessions,
  majors, levels, grades, juryRoleTemplates, tblDefenseSettings,
  tblGeneralSettings, tblDefenseTypeConfig, tblDocumentConfig,
  tblJuries, tblProjects, tblProjectStudents,
  getFlatUser,
} from "./db";
import type { DbJuryRoleTemplate } from "./db";
import { auditLogHandlers } from "./audit-log-handlers";

export const adminHandlers = [
  http.post("/api/login", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { email, password } = (await request.json()) as { email: string; password?: string };
    const user = tblUsers.find((u) => u.email === email && u.password === password);

    if (user) {
      const userWithoutPassword = { ...user } as Partial<typeof user>;
      delete userWithoutPassword.password;
      const expiresIn = 60 * 60 * 1000 * 2;
      const expiresAt = Date.now() + expiresIn;

      return HttpResponse.json({
        user: getFlatUser(user.id),
        token: `mock-jwt-token-${user.role}`,
        expiresAt,
      });
    }

    return new HttpResponse(
      JSON.stringify({ message: "Identifiants invalides (E-mail ou mot de passe incorrect)" }),
      { status: 401 },
    );
  }),

  // ─── Generic user list (flat, no JOIN) ────────────────────────────

  http.get("/api/admin/users", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const page = Number.parseInt(url.searchParams.get("page") || "0");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    let filtered = tblUsers;
    if (role) {
      filtered = tblUsers.filter((u) => u.role === role);
    }
    const safe = filtered.map((u) => getFlatUser(u.id)!);
    const start = page * limit;
    const end = start + limit;
    const items = safe.slice(start, end);

    return HttpResponse.json({
      items,
      total: safe.length,
      pageCount: Math.ceil(safe.length / limit),
    });
  }),

  http.get("/api/admin/users/teachers-list", async () => {
    await delay(MOCK_DELAY);
    const teachers = tblUsers
      .filter((u) => u.role === "teacher")
      .map((u) => {
        const t = tblTeachers.find((t) => t.id === u.id);
        return {
          ...getFlatUser(u.id)!,
          gradeId: t?.gradeId ?? "",
          departmentId: t?.departmentId ?? "",
        } as Teacher;
      });
    return HttpResponse.json({ items: teachers, total: teachers.length, pageCount: 1 });
  }),

  http.get("/api/admin/users/students-list", async () => {
    await delay(MOCK_DELAY);
    const students = tblUsers
      .filter((u) => u.role === "student")
      .map((u) => {
        const s = tblStudents.find((st) => st.id === u.id);
        return {
          ...getFlatUser(u.id)!,
          cne: s?.cne ?? "",
          majorId: s?.majorId ?? "",
          levelId: s?.levelId ?? "",
        } as Student;
      });
    return HttpResponse.json({ items: students, total: students.length, pageCount: 1 });
  }),

  // ─── Per-role student endpoints ──────────────────────────────────

  http.get("/api/admin/students", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "0");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    const all = tblUsers
      .filter((u) => u.role === "student")
      .map((u) => {
        const s = tblStudents.find((st) => st.id === u.id);
        return {
          ...getFlatUser(u.id)!,
          cne: s?.cne ?? "",
          majorId: s?.majorId ?? "",
          levelId: s?.levelId ?? "",
        } as Student;
      });
    const start = page * limit;
    const end = start + limit;
    return HttpResponse.json({
      items: all.slice(start, end),
      total: all.length,
      pageCount: Math.ceil(all.length / limit),
    });
  }),

  http.post("/api/admin/students", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Partial<Student>;
    if (body.majorId && !majors.find((m) => m.id === body.majorId)) {
      return HttpResponse.json({ message: "Filière introuvable. Créez-la d'abord dans Configuration." }, { status: 400 });
    }
    if (body.levelId && !levels.find((l) => l.id === body.levelId)) {
      return HttpResponse.json({ message: "Niveau introuvable. Créez-le d'abord dans Configuration." }, { status: 400 });
    }
    const id = Math.random().toString(36).substr(2, 9);
    tblUsers.push({
      id, email: body.email ?? "", password: "",
      role: "student", lastName: body.lastName ?? "",
      firstName: body.firstName ?? "", isActive: false,
    });
    tblStudents.push({
      id,
      cne: body.cne ?? "",
      majorId: body.majorId ?? "",
      levelId: body.levelId ?? "",
    });
    const s = tblStudents.find((st) => st.id === id);
    const result = {
      ...getFlatUser(id)!,
      cne: s?.cne ?? "",
      majorId: s?.majorId ?? "",
      levelId: s?.levelId ?? "",
    } as Student;
    return HttpResponse.json(result);
  }),

  // ─── Per-role teacher endpoints ──────────────────────────────────

  http.get("/api/admin/teachers", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "0");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    const all = tblUsers
      .filter((u) => u.role === "teacher")
      .map((u) => {
        const t = tblTeachers.find((te) => te.id === u.id);
        return {
          ...getFlatUser(u.id)!,
          gradeId: t?.gradeId ?? "",
          departmentId: t?.departmentId ?? "",
        } as Teacher;
      });
    const start = page * limit;
    const end = start + limit;
    return HttpResponse.json({
      items: all.slice(start, end),
      total: all.length,
      pageCount: Math.ceil(all.length / limit),
    });
  }),

  http.post("/api/admin/teachers", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Partial<Teacher>;
    if (body.departmentId && !tblDepartments.find((d) => d.id === body.departmentId)) {
      return HttpResponse.json({ message: "Département introuvable. Créez-le d'abord." }, { status: 400 });
    }
    if (body.gradeId && !grades.find((g) => g.id === body.gradeId)) {
      return HttpResponse.json({ message: "Grade introuvable. Créez-le d'abord dans Configuration." }, { status: 400 });
    }
    const id = Math.random().toString(36).substr(2, 9);
    tblUsers.push({
      id, email: body.email ?? "", password: "",
      role: "teacher", lastName: body.lastName ?? "",
      firstName: body.firstName ?? "", isActive: false,
    });
    tblTeachers.push({
      id,
      gradeId: body.gradeId ?? "",
      departmentId: body.departmentId ?? "",
    });
    const result = {
      ...getFlatUser(id)!,
      gradeId: body.gradeId ?? "",
      departmentId: body.departmentId ?? "",
    } as Teacher;
    return HttpResponse.json(result);
  }),

  // ─── Per-role coordinator endpoints ────────────────────────────

  http.get("/api/admin/coordinators", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "0");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    const all = tblUsers
      .filter((u) => u.role === "coordinator")
      .map((u) => getFlatUser(u.id)! as Coordinator);
    const start = page * limit;
    const end = start + limit;
    return HttpResponse.json({
      items: all.slice(start, end),
      total: all.length,
      pageCount: Math.ceil(all.length / limit),
    });
  }),

  http.post("/api/admin/coordinators", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Partial<Coordinator>;
    const id = Math.random().toString(36).substr(2, 9);
    tblUsers.push({
      id, email: body.email ?? "", password: "",
      role: "coordinator", lastName: body.lastName ?? "",
      firstName: body.firstName ?? "", isActive: false,
    });
    tblCoordinators.push({ id });
    return HttpResponse.json(getFlatUser(id)! as Coordinator);
  }),

  // ─── Generic user write endpoints ──────────────────────────────

  http.post("/api/admin/users", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Record<string, unknown>;
    const role = (body.role as string) || "student";
    if (role === "student") {
      if (body.majorId && !majors.find((m) => m.id === body.majorId)) {
        return HttpResponse.json({ message: "Filière introuvable. Créez-la d'abord dans Configuration." }, { status: 400 });
      }
      if (body.levelId && !levels.find((l) => l.id === body.levelId)) {
        return HttpResponse.json({ message: "Niveau introuvable. Créez-le d'abord dans Configuration." }, { status: 400 });
      }
    } else if (role === "teacher") {
      if (body.departmentId && !tblDepartments.find((d) => d.id === body.departmentId)) {
        return HttpResponse.json({ message: "Département introuvable. Créez-le d'abord." }, { status: 400 });
      }
      if (body.gradeId && !grades.find((g) => g.id === body.gradeId)) {
        return HttpResponse.json({ message: "Grade introuvable. Créez-le d'abord dans Configuration." }, { status: 400 });
      }
    }
    const id = Math.random().toString(36).substr(2, 9);
    tblUsers.push({
      id,
      email: (body.email as string) ?? "",
      password: "",
      role: (role === "admin" || role === "coordinator" || role === "teacher" || role === "student" ? role : "student") as "admin" | "coordinator" | "teacher" | "student",
      lastName: (body.lastName as string) ?? "",
      firstName: (body.firstName as string) ?? "",
      isActive: false,
    });
    if (role === "student") {
      tblStudents.push({
        id,
        cne: (body.cne as string) ?? "",
        majorId: (body.majorId as string) ?? "",
        levelId: (body.levelId as string) ?? "",
      });
    } else if (role === "teacher") {
      tblTeachers.push({
        id,
        gradeId: (body.gradeId as string) ?? "",
        departmentId: (body.departmentId as string) ?? "",
      });
    } else if (role === "coordinator") {
      tblCoordinators.push({ id });
    }
    console.log(
      `[Mock Email] Sending verification link to ${body.email}: /verify-account?token=${btoa(id)}`,
    );
    return HttpResponse.json(getFlatUser(id)!);
  }),

  http.post("/api/admin/users/bulk", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { users, role } = (await request.json()) as {
      users: Record<string, string>[];
      role: "student" | "teacher" | "coordinator";
    };

    if (role === "student") {
      const allMajorNames = [...new Set(users.map((u) => u.majorName).filter(Boolean))];
      const allLevelNames = [...new Set(users.map((u) => u.levelName).filter(Boolean))];
      const unknownMajors = allMajorNames.filter((n) => !majors.find((m) => m.name === n));
      const unknownLevels = allLevelNames.filter((n) => !levels.find((l) => l.name === n));
      if (unknownMajors.length || unknownLevels.length) {
        const parts: string[] = [];
        if (unknownMajors.length) parts.push(`Filières inconnues : ${unknownMajors.join(", ")}`);
        if (unknownLevels.length) parts.push(`Niveaux inconnus : ${unknownLevels.join(", ")}`);
        return HttpResponse.json({ message: parts.join(". ") + ". Créez-les d'abord dans Configuration." }, { status: 400 });
      }
    } else if (role === "teacher") {
      const allDeptNames = [...new Set(users.map((u) => u.departmentName).filter(Boolean))];
      const allGradeNames = [...new Set(users.map((u) => u.gradeName).filter(Boolean))];
      const unknownDepts = allDeptNames.filter((n) => !tblDepartments.find((d) => d.name === n));
      const unknownGrades = allGradeNames.filter((n) => !grades.find((g) => g.name === n));
      if (unknownDepts.length || unknownGrades.length) {
        const parts: string[] = [];
        if (unknownDepts.length) parts.push(`Départements inconnus : ${unknownDepts.join(", ")}`);
        if (unknownGrades.length) parts.push(`Grades inconnus : ${unknownGrades.join(", ")}`);
        return HttpResponse.json({ message: parts.join(". ") + ". Créez-les d'abord." }, { status: 400 });
      }
    }

    const created = users.map((u) => {
      const id = Math.random().toString(36).substr(2, 9);
      tblUsers.push({
        id,
        lastName: u.lastName ?? "",
        firstName: u.firstName ?? "",
        email: u.email ?? "",
        password: "",
        role,
        isActive: false,
      });
      if (role === "student") {
        tblStudents.push({
          id,
          cne: u.cne ?? "",
          majorId: majors.find((f) => f.name === u.majorName)!.id,
          levelId: levels.find((l) => l.name === u.levelName)!.id,
        });
      } else if (role === "teacher") {
        tblTeachers.push({
          id,
          gradeId: grades.find((g) => g.name === u.gradeName)!.id,
          departmentId: tblDepartments.find((d) => d.name === u.departmentName)!.id,
        });
      }
      return getFlatUser(id)!;
    });

    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/auth/verify-account", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { token, password } = (await request.json()) as { token: string; password: string };
    const userId = atob(token);
    const user = tblUsers.find((u) => u.id === userId);
    if (!user) return new HttpResponse(null, { status: 404 });

    user.password = password;
    user.isActive = true;
    return HttpResponse.json({ message: "Account verified successfully" });
  }),

  http.put("/api/admin/users/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Record<string, unknown>;
    const uIdx = tblUsers.findIndex((u) => u.id === id);
    if (uIdx === -1) return new HttpResponse(null, { status: 404 });

    const user = tblUsers[uIdx];
    if (body.lastName !== undefined) user.lastName = body.lastName as string;
    if (body.firstName !== undefined) user.firstName = body.firstName as string;
    if (body.email !== undefined) user.email = body.email as string;

    if (user.role === "student") {
      if ((body.majorId as string) && !majors.find((m) => m.id === body.majorId)) {
        return HttpResponse.json({ message: "Filière introuvable." }, { status: 400 });
      }
      if ((body.levelId as string) && !levels.find((l) => l.id === body.levelId)) {
        return HttpResponse.json({ message: "Niveau introuvable." }, { status: 400 });
      }
      const sIdx = tblStudents.findIndex((s) => s.id === id);
      if (sIdx !== -1) {
        if (body.cne !== undefined) tblStudents[sIdx].cne = body.cne as string;
        if (body.majorId !== undefined) tblStudents[sIdx].majorId = body.majorId as string;
        if (body.levelId !== undefined) tblStudents[sIdx].levelId = body.levelId as string;
      }
    } else if (user.role === "teacher") {
      if ((body.departmentId as string) && !tblDepartments.find((d) => d.id === body.departmentId)) {
        return HttpResponse.json({ message: "Département introuvable." }, { status: 400 });
      }
      if ((body.gradeId as string) && !grades.find((g) => g.id === body.gradeId)) {
        return HttpResponse.json({ message: "Grade introuvable." }, { status: 400 });
      }
      const tIdx = tblTeachers.findIndex((t) => t.id === id);
      if (tIdx !== -1) {
        if (body.gradeId !== undefined) tblTeachers[tIdx].gradeId = body.gradeId as string;
        if (body.departmentId !== undefined) tblTeachers[tIdx].departmentId = body.departmentId as string;
      }
    }

    const safeUser = { ...tblUsers[uIdx] };
    delete (safeUser as Record<string, unknown>).password;
    return HttpResponse.json(safeUser);
  }),

  http.delete("/api/admin/users/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const uIdx = tblUsers.findIndex((u) => u.id === id);
    if (uIdx === -1) return new HttpResponse(null, { status: 404 });

    const user = tblUsers[uIdx];
    if (user.role === "teacher") {
      const nbDepts = tblDepartments.filter((d) => d.headId === id).length;
      const nbJuries = tblJuries.filter(
        (j) => j.presidentId === id || j.reporterId === id || j.examinerId === id,
      ).length;
      const nbProjects = tblProjects.filter((p) => p.supervisorId === id).length;
      const parts: string[] = [];
      if (nbDepts > 0) parts.push(`chef de ${nbDepts} département(s)`);
      if (nbJuries > 0) parts.push(`membre de ${nbJuries} jury(s)`);
      if (nbProjects > 0) parts.push(`encadrant de ${nbProjects} projet(s)`);
      if (parts.length > 0) {
        return HttpResponse.json(
          { message: `Impossible de supprimer cet enseignant : il/elle est ${parts.join(", ")}.` },
          { status: 409 },
        );
      }
    }

    if (user.role === "student") {
      const nbProjects = tblProjectStudents.filter((ps) => ps.studentId === id).length;
      if (nbProjects > 0) {
        return HttpResponse.json(
          { message: `Impossible de supprimer cet étudiant : il/elle est lié(e) à ${nbProjects} projet(s).` },
          { status: 409 },
        );
      }
    }

    tblUsers.splice(uIdx, 1);
    const sIdx = tblStudents.findIndex((s) => s.id === id);
    if (sIdx !== -1) tblStudents.splice(sIdx, 1);
    const tIdx = tblTeachers.findIndex((t) => t.id === id);
    if (tIdx !== -1) tblTeachers.splice(tIdx, 1);
    const cIdx = tblCoordinators.findIndex((c) => c.id === id);
    if (cIdx !== -1) tblCoordinators.splice(cIdx, 1);

    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Departments ──────────────────────────────────────────────────

  http.get("/api/admin/departments", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblDepartments);
  }),

  http.post("/api/admin/departments", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Department, "id">;
    const newDept = { ...body, id: (tblDepartments.length + 1).toString() };
    tblDepartments.push(newDept);
    return HttpResponse.json(newDept);
  }),

  http.put("/api/admin/departments/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Department, "id">;
    const index = tblDepartments.findIndex((d) => d.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblDepartments[index] = { ...tblDepartments[index], ...body };
    return HttpResponse.json(tblDepartments[index]);
  }),

  http.delete("/api/admin/departments/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblDepartments.findIndex((d) => d.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const nbRooms = tblRooms.filter((r) => r.departmentId === id).length;
    const nbTeachers = tblTeachers.filter((t) => t.departmentId === id).length;
    const parts: string[] = [];
    if (nbRooms > 0) parts.push(`${nbRooms} salle(s)`);
    if (nbTeachers > 0) parts.push(`${nbTeachers} enseignant(s)`);
    if (parts.length > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer ce département : ${parts.join(" et ")} y sont rattaché(e)s.` },
        { status: 409 },
      );
    }

    tblDepartments.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Sessions ─────────────────────────────────────────────────────

  http.get("/api/admin/sessions", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblSessions);
  }),

  http.post("/api/admin/sessions", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Session, "id">;
    const newS = { ...body, id: (tblSessions.length + 1).toString() };
    tblSessions.push(newS);
    return HttpResponse.json(newS);
  }),

  http.put("/api/admin/sessions/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Session, "id">;
    const index = tblSessions.findIndex((s) => s.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblSessions[index] = { ...tblSessions[index], ...body };
    return HttpResponse.json(tblSessions[index]);
  }),

  http.delete("/api/admin/sessions/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblSessions.findIndex((s) => s.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    const nbSoutenances = tblDefenseSessions.filter((ds) => ds.globalSessionId === id).length;
    if (nbSoutenances > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer cette session académique : ${nbSoutenances} soutenance(s) y sont rattachée(s).` },
        { status: 409 },
      );
    }

    tblSessions.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Defense Sessions ──────────────────────────────────────────────

  http.get("/api/admin/defense-sessions", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblDefenseSessions);
  }),

  http.post("/api/admin/defense-sessions", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<DefenseSession, "id">;
    if (body.globalSessionId && !tblSessions.find((s) => s.id === body.globalSessionId)) {
      return HttpResponse.json({ message: "Session globale introuvable. Créez-la d'abord." }, { status: 400 });
    }
    if (body.juryRoleTemplateId && !juryRoleTemplates.find((t) => t.id === body.juryRoleTemplateId)) {
      return HttpResponse.json({ message: "Template de jury introuvable. Créez-le d'abord dans Configuration." }, { status: 400 });
    }
    const newDS = { ...body, id: `ds${tblDefenseSessions.length + 1}` };
    tblDefenseSessions.push(newDS);
    return HttpResponse.json(newDS, { status: 201 });
  }),

  http.put("/api/admin/defense-sessions/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<DefenseSession, "id">;
    if (body.globalSessionId && !tblSessions.find((s) => s.id === body.globalSessionId)) {
      return HttpResponse.json({ message: "Session globale introuvable." }, { status: 400 });
    }
    if (body.juryRoleTemplateId && !juryRoleTemplates.find((t) => t.id === body.juryRoleTemplateId)) {
      return HttpResponse.json({ message: "Template de jury introuvable." }, { status: 400 });
    }
    const index = tblDefenseSessions.findIndex((ds) => ds.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblDefenseSessions[index] = { ...tblDefenseSessions[index], ...body };
    return HttpResponse.json(tblDefenseSessions[index]);
  }),

  http.delete("/api/admin/defense-sessions/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblDefenseSessions.findIndex((ds) => ds.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblDefenseSessions.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Rooms ────────────────────────────────────────────────────────

  http.get("/api/admin/rooms", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblRooms);
  }),

  http.post("/api/admin/rooms/bulk", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { rooms } = (await request.json()) as { rooms: Record<string, unknown>[] };
    const deptIds = [...new Set(rooms.map((r) => String(r.departmentId)).filter(Boolean))];
    const unknownDepts = deptIds.filter((id) => !tblDepartments.find((d) => d.id === id));
    if (unknownDepts.length) {
      return HttpResponse.json({ message: `Départements introuvables : ${unknownDepts.join(", ")}` }, { status: 400 });
    }
    const created: Room[] = rooms.map((r) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: String(r.name ?? ""),
      departmentId: String(r.departmentId ?? ""),
      capacity: Number(r.capacity) || 0,
    }));
    tblRooms.push(...created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/admin/rooms", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Room, "id">;
    if (body.departmentId && !tblDepartments.find((d) => d.id === body.departmentId)) {
      return HttpResponse.json({ message: "Département introuvable. Créez-le d'abord." }, { status: 400 });
    }
    const newR = { ...body, id: (tblRooms.length + 1).toString() };
    tblRooms.push(newR);
    return HttpResponse.json(newR);
  }),

  http.put("/api/admin/rooms/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Room, "id">;
    if (body.departmentId && !tblDepartments.find((d) => d.id === body.departmentId)) {
      return HttpResponse.json({ message: "Département introuvable." }, { status: 400 });
    }
    const index = tblRooms.findIndex((r) => r.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblRooms[index] = { ...tblRooms[index], ...body };
    return HttpResponse.json(tblRooms[index]);
  }),

  http.delete("/api/admin/rooms/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = tblRooms.findIndex((r) => r.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    tblRooms.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/stats", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      totalStudents: tblUsers.filter((u) => u.role === "student").length,
      totalTeachers: tblUsers.filter((u) => u.role === "teacher").length,
      totalDepartments: tblDepartments.length,
      totalRooms: tblRooms.length,
      activeSessions: tblSessions.filter((s) => s.status === "active").length,
      upcomingDefenses: 12,
    });
  }),

  // ─── Config (majors, levels, grades, settings) ──────────────────

  http.get("/api/admin/config/majors", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(majors);
  }),
  http.post("/api/admin/config/majors", async ({ request }) => {
    const body = (await request.json()) as Omit<Major, "id">;
    const newItem = { ...body, id: `f${majors.length + 1}` };
    majors.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/majors/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Major, "id">;
    const idx = majors.findIndex((f) => f.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    majors[idx] = { ...majors[idx], ...body };
    return HttpResponse.json(majors[idx]);
  }),
  http.delete("/api/admin/config/majors/:id", async ({ params }) => {
    const { id } = params;
    const idx = majors.findIndex((f) => f.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const nbStudents = tblStudents.filter((s) => s.majorId === id).length;
    if (nbStudents > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer cette filière : ${nbStudents} étudiant(s) y sont inscrit(s).` },
        { status: 409 },
      );
    }

    majors.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/levels", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(levels);
  }),
  http.post("/api/admin/config/levels", async ({ request }) => {
    const body = (await request.json()) as Omit<Level, "id">;
    const newItem = { ...body, id: `n${levels.length + 1}` };
    levels.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/levels/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Level, "id">;
    const idx = levels.findIndex((l) => l.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    levels[idx] = { ...levels[idx], ...body };
    return HttpResponse.json(levels[idx]);
  }),
  http.delete("/api/admin/config/levels/:id", async ({ params }) => {
    const { id } = params;
    const idx = levels.findIndex((l) => l.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const nbStudents = tblStudents.filter((s) => s.levelId === id).length;
    if (nbStudents > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer ce niveau : ${nbStudents} étudiant(s) y sont inscrit(s).` },
        { status: 409 },
      );
    }

    levels.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/grades", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(grades);
  }),
  http.post("/api/admin/config/grades", async ({ request }) => {
    const body = (await request.json()) as Omit<Grade, "id">;
    const newItem = { ...body, id: `g${grades.length + 1}` };
    grades.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/grades/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Grade, "id">;
    const idx = grades.findIndex((g) => g.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    grades[idx] = { ...grades[idx], ...body };
    return HttpResponse.json(grades[idx]);
  }),
  http.delete("/api/admin/config/grades/:id", async ({ params }) => {
    const { id } = params;
    const idx = grades.findIndex((g) => g.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const nbTeachers = tblTeachers.filter((t) => t.gradeId === id).length;
    if (nbTeachers > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer ce grade : ${nbTeachers} enseignant(s) l'ont.` },
        { status: 409 },
      );
    }

    grades.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── Jury Role Templates ───────────────────────────────────────

  http.get("/api/admin/config/jury-role-templates", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(juryRoleTemplates);
  }),

  http.post("/api/admin/config/jury-role-templates", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<DbJuryRoleTemplate, "id">;
    const newItem = { ...body, id: `jt${juryRoleTemplates.length + 1}` };
    juryRoleTemplates.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put("/api/admin/config/jury-role-templates/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<DbJuryRoleTemplate, "id">;
    const idx = juryRoleTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    juryRoleTemplates[idx] = { ...juryRoleTemplates[idx], ...body };
    return HttpResponse.json(juryRoleTemplates[idx]);
  }),

  http.delete("/api/admin/config/jury-role-templates/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const idx = juryRoleTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });

    const nbSessions = tblDefenseSessions.filter((ds) => ds.juryRoleTemplateId === id).length;
    if (nbSessions > 0) {
      return HttpResponse.json(
        { message: `Impossible de supprimer ce template de jury : ${nbSessions} soutenance(s) l'utilisent.` },
        { status: 409 },
      );
    }

    juryRoleTemplates.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/settings", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblDefenseSettings);
  }),
  http.post("/api/admin/config/settings", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Partial<typeof tblDefenseSettings>;
    Object.assign(tblDefenseSettings, body);
    return HttpResponse.json({ ...tblDefenseSettings });
  }),

  http.get("/api/admin/config/general", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({ ...tblGeneralSettings });
  }),
  http.put("/api/admin/config/general", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    Object.assign(tblGeneralSettings, body);
    return HttpResponse.json({ ...tblGeneralSettings });
  }),

  http.get("/api/admin/config/defense-types", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      pfe: { ...tblDefenseTypeConfig.pfe },
      memoire: { ...tblDefenseTypeConfig.memoire },
      these: { ...tblDefenseTypeConfig.these },
    });
  }),
  http.put("/api/admin/config/defense-types", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    const typed = body as typeof tblDefenseTypeConfig;
    if (typed.pfe) Object.assign(tblDefenseTypeConfig.pfe, typed.pfe);
    if (typed.memoire) Object.assign(tblDefenseTypeConfig.memoire, typed.memoire);
    if (typed.these) Object.assign(tblDefenseTypeConfig.these, typed.these);
    return HttpResponse.json({
      pfe: { ...tblDefenseTypeConfig.pfe },
      memoire: { ...tblDefenseTypeConfig.memoire },
      these: { ...tblDefenseTypeConfig.these },
    });
  }),

  http.get("/api/admin/config/documents", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({ ...tblDocumentConfig });
  }),
  http.put("/api/admin/config/documents", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    Object.assign(tblDocumentConfig, body);
    return HttpResponse.json({ ...tblDocumentConfig });
  }),

  ...auditLogHandlers,
];
