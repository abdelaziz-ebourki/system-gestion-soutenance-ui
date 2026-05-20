import { http, HttpResponse, delay } from "msw";
import type { User, Department, Session, Room, Major, Level, Grade, Student } from "@/types";
import {
  MOCK_DELAY,
  mockUsers, mockDepartments, mockSessions, mockRooms,
  mockMajors, mockLevels, mockGrades,
  defenseSettings,
} from "./data";
import { auditLogHandlers } from "./audit-log-handlers";

export const adminHandlers = [
  http.post("/api/login", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { email, password } = (await request.json()) as {
      email: string;
      password?: string;
    };
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      const expiresIn = 60 * 60 * 1000 * 2;
      const expiresAt = Date.now() + expiresIn;

      return HttpResponse.json({
        user: userWithoutPassword,
        token: `mock-jwt-token-${user.role}`,
        expiresAt,
      });
    }

    return new HttpResponse(
      JSON.stringify({
        message: "Identifiants invalides (E-mail ou mot de passe incorrect)",
      }),
      { status: 401 },
    );
  }),

  http.get("/api/admin/users", async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const page = Number.parseInt(url.searchParams.get("page") || "0");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");

    let filtered = mockUsers;
    if (role) {
      filtered = mockUsers.filter((u) => u.role === role);
    }

    const start = page * limit;
    const end = start + limit;
    const items = filtered.slice(start, end);

    return HttpResponse.json({
      items,
      total: filtered.length,
      pageCount: Math.ceil(filtered.length / limit),
    });
  }),

  http.post("/api/admin/users", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<User, "id" | "password">;
    const newUser: User = {
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      password: "",
      isActive: false,
    };
    mockUsers.push(newUser);
    console.log(
      `[Mock Email] Sending verification link to ${newUser.email}: /verify-account?token=${btoa(newUser.id)}`,
    );
    return HttpResponse.json(newUser);
  }),

  http.post("/api/admin/users/bulk", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { users, role } = (await request.json()) as {
      users: Record<string, string>[];
      role: "student" | "teacher" | "coordinator";
    };

    const createdUsers = users.map((u) => {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: "",
        role,
        isActive: false,
      };

      if (role === "student") {
        const student = newUser as Student;
        student.cne = u.cne;
        student.majorId =
          mockMajors.find((f) => f.name === u.majorName)?.id || "f1";
        student.levelId =
          mockLevels.find((l) => l.name === u.levelName)?.id || "n1";
        return student;
      } else if (role === "teacher") {
        const teacher = newUser as User;
        (teacher as unknown as Record<string, string | boolean | undefined>).departmentId =
          mockDepartments.find((d) => d.name === u.departmentName)?.id || "1";
        (teacher as unknown as Record<string, string | boolean | undefined>).gradeId =
          mockGrades.find((g) => g.name === u.gradeName)?.id || "g1";
        return teacher;
      }
      console.log(
        `[Mock Email] Sending verification link to ${newUser.email}: /verify-account?token=${btoa(newUser.id)}`,
      );
      return newUser;
    });

    mockUsers.push(...createdUsers);
    return HttpResponse.json(createdUsers, { status: 201 });
  }),

  http.post("/api/auth/verify-account", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { token, password } = (await request.json()) as {
      token: string;
      password: string;
    };
    const userId = atob(token);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return new HttpResponse(null, { status: 404 });

    user.password = password;
    user.isActive = true;
    return HttpResponse.json({ message: "Account verified successfully" });
  }),

  http.put("/api/admin/users/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<User, "id">;
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockUsers[index] = { ...mockUsers[index], ...body };
    return HttpResponse.json(mockUsers[index]);
  }),

  http.delete("/api/admin/users/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockUsers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/departments", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockDepartments);
  }),

  http.post("/api/admin/departments", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Department, "id">;
    const newDept: Department = {
      ...body,
      id: (mockDepartments.length + 1).toString(),
    };
    mockDepartments.push(newDept);
    return HttpResponse.json(newDept);
  }),

  http.put("/api/admin/departments/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Department, "id">;
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockDepartments[index] = { ...mockDepartments[index], ...body };
    return HttpResponse.json(mockDepartments[index]);
  }),

  http.delete("/api/admin/departments/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockDepartments.findIndex((d) => d.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockDepartments.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/sessions", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockSessions);
  }),

  http.post("/api/admin/sessions", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Session, "id">;
    const newSession: Session = {
      ...body,
      id: (mockSessions.length + 1).toString(),
    };
    mockSessions.push(newSession);
    return HttpResponse.json(newSession);
  }),

  http.put("/api/admin/sessions/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Session, "id">;
    const index = mockSessions.findIndex((s) => s.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockSessions[index] = { ...mockSessions[index], ...body };
    return HttpResponse.json(mockSessions[index]);
  }),

  http.delete("/api/admin/sessions/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockSessions.findIndex((s) => s.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockSessions.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/rooms", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockRooms);
  }),

  http.post("/api/admin/rooms/bulk", async ({ request }) => {
    await delay(MOCK_DELAY);
    const { rooms } = (await request.json()) as { rooms: Record<string, unknown>[] };
    const createdRooms: Room[] = rooms.map((r) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: String(r.name ?? ""),
      departmentId: String(r.departmentId ?? ""),
      capacity: Number(r.capacity) || 0,
    }));
    mockRooms.push(...createdRooms);
    return HttpResponse.json(createdRooms, { status: 201 });
  }),

  http.post("/api/admin/rooms", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<Room, "id">;
    const newRoom: Room = {
      ...body,
      id: (mockRooms.length + 1).toString(),
    };
    mockRooms.push(newRoom);
    return HttpResponse.json(newRoom);
  }),

  http.put("/api/admin/rooms/:id", async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const body = (await request.json()) as Omit<Room, "id">;
    const index = mockRooms.findIndex((r) => r.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockRooms[index] = { ...mockRooms[index], ...body };
    return HttpResponse.json(mockRooms[index]);
  }),

  http.delete("/api/admin/rooms/:id", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const index = mockRooms.findIndex((r) => r.id === id);
    if (index === -1) return new HttpResponse(null, { status: 404 });

    mockRooms.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/stats", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      totalStudents: mockUsers.filter((u) => u.role === "student").length,
      totalTeachers: mockUsers.filter((u) => u.role === "teacher").length,
      totalDepartments: mockDepartments.length,
      totalRooms: mockRooms.length,
      activeSessions: mockSessions.filter((s) => s.status === "active").length,
      upcomingDefenses: 12,
    });
  }),

  http.get("/api/admin/config/majors", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockMajors);
  }),
  http.post("/api/admin/config/majors", async ({ request }) => {
    const body = (await request.json()) as Omit<Major, "id">;
    const newItem = { ...body, id: `f${mockMajors.length + 1}` };
    mockMajors.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/majors/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Major, "id">;
    const idx = mockMajors.findIndex((f) => f.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockMajors[idx] = { ...mockMajors[idx], ...body };
    return HttpResponse.json(mockMajors[idx]);
  }),
  http.delete("/api/admin/config/majors/:id", async ({ params }) => {
    const { id } = params;
    const idx = mockMajors.findIndex((f) => f.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockMajors.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/levels", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockLevels);
  }),
  http.post("/api/admin/config/levels", async ({ request }) => {
    const body = (await request.json()) as Omit<Level, "id">;
    const newItem = { ...body, id: `n${mockLevels.length + 1}` };
    mockLevels.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/levels/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Level, "id">;
    const idx = mockLevels.findIndex((l) => l.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockLevels[idx] = { ...mockLevels[idx], ...body };
    return HttpResponse.json(mockLevels[idx]);
  }),
  http.delete("/api/admin/config/levels/:id", async ({ params }) => {
    const { id } = params;
    const idx = mockLevels.findIndex((l) => l.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockLevels.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/grades", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(mockGrades);
  }),
  http.post("/api/admin/config/grades", async ({ request }) => {
    const body = (await request.json()) as Omit<Grade, "id">;
    const newItem = { ...body, id: `g${mockGrades.length + 1}` };
    mockGrades.push(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put("/api/admin/config/grades/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Omit<Grade, "id">;
    const idx = mockGrades.findIndex((g) => g.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockGrades[idx] = { ...mockGrades[idx], ...body };
    return HttpResponse.json(mockGrades[idx]);
  }),
  http.delete("/api/admin/config/grades/:id", async ({ params }) => {
    const { id } = params;
    const idx = mockGrades.findIndex((g) => g.id === id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    mockGrades.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/admin/config/settings", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(defenseSettings);
  }),
  http.post("/api/admin/config/settings", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Partial<typeof defenseSettings>;
    Object.assign(defenseSettings, body);
    return HttpResponse.json(defenseSettings);
  }),

  ...auditLogHandlers,
];
