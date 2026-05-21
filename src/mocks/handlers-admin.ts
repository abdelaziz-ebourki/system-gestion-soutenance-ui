import { http, HttpResponse, delay } from "msw";
import type { Teacher, Coordinator, Department, Session, Room, Major, Level, Grade, Student } from "@/types";
import {
  MOCK_DELAY,
  tblUsers, tblStudents, tblTeachers, tblCoordinators,
  tblDepartments, tblSessions, tblRooms,
  majors, levels, grades, tblDefenseSettings,
  getFlatUser,
} from "./db";
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
          majorId: majors.find((f) => f.name === u.majorName)?.id || "f1",
          levelId: levels.find((l) => l.name === u.levelName)?.id || "n1",
        });
      } else if (role === "teacher") {
        tblTeachers.push({
          id,
          gradeId: grades.find((g) => g.name === u.gradeName)?.id || "g1",
          departmentId: tblDepartments.find((d) => d.name === u.departmentName)?.id || "1",
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
      const sIdx = tblStudents.findIndex((s) => s.id === id);
      if (sIdx !== -1) {
        if (body.cne !== undefined) tblStudents[sIdx].cne = body.cne as string;
        if (body.majorId !== undefined) tblStudents[sIdx].majorId = body.majorId as string;
        if (body.levelId !== undefined) tblStudents[sIdx].levelId = body.levelId as string;
      }
    } else if (user.role === "teacher") {
      const tIdx = tblTeachers.findIndex((t) => t.id === id);
      if (tIdx !== -1) {
        if (body.gradeId !== undefined) tblTeachers[tIdx].gradeId = body.gradeId as string;
        if (body.departmentId !== undefined) tblTeachers[tIdx].departmentId = body.departmentId as string;
      }
    }

    const { password: _, ...safeUser } = tblUsers[uIdx];
    return HttpResponse.json(safeUser);
  }),

  http.delete("/api/admin/users/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const uIdx = tblUsers.findIndex((u) => u.id === id);
    if (uIdx === -1) return new HttpResponse(null, { status: 404 });

    tblUsers.splice(uIdx, 1);
    // Clean up role-specific tables
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
    tblSessions.splice(index, 1);
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
    const newR = { ...body, id: (tblRooms.length + 1).toString() };
    tblRooms.push(newR);
    return HttpResponse.json(newR);
  }),

  http.put("/api/admin/rooms/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Room, "id">;
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
    grades.splice(idx, 1);
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

  ...auditLogHandlers,
];
