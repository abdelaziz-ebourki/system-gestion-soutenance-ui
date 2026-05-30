import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth
  http.post("*/api/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === "admin@univh2c.ma" && body.password === "1234") {
      return HttpResponse.json({
        token: "mock-jwt-token",
        user: {
          id: 1,
          email: "admin@univh2c.ma",
          role: "admin",
          lastName: "Admin",
          firstName: "User",
        },
        expiresAt: Date.now() + 7200000,
      });
    }
    if (body.email === "teacher@univh2c.ma" && body.password === "1234") {
      return HttpResponse.json({
        token: "mock-jwt-token",
        user: {
          id: 2,
          email: "teacher@univh2c.ma",
          role: "teacher",
          lastName: "Teacher",
          firstName: "User",
        },
        expiresAt: Date.now() + 7200000,
      });
    }
    return HttpResponse.json(
      { message: "Identifiants invalides" },
      { status: 401 },
    );
  }),

  http.post("*/api/auth/forgot-password", async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (body.email === "nonexistent@test.com") {
      return HttpResponse.json({ message: "Si cet email existe, un lien..." });
    }
    return HttpResponse.json({ message: "Si cet email existe, un lien..." });
  }),

  http.post("*/api/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { token?: string; password?: string };
    if (body.token === "expired-token") {
      return HttpResponse.json(
        { message: "Token expiré" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ message: "Mot de passe réinitialisé" });
  }),

  http.post("*/api/auth/verify-account", async ({ request }) => {
    const body = (await request.json()) as { token?: string; password?: string };
    if (body.token === "invalid-token") {
      return HttpResponse.json(
        { message: "Token invalide" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ message: "Account verified successfully" });
  }),

  // Notifications
  http.get("*/api/notifications", () =>
    HttpResponse.json([
      {
        id: "1",
        type: "info",
        title: "Notification test",
        message: "Ceci est une notification de test",
        timestamp: Date.now(),
        read: false,
      },
    ]),
  ),

  http.put("*/api/notifications/:id/read", () =>
    HttpResponse.json({ message: "Marked as read" }),
  ),

  http.put("*/api/notifications/read-all", () =>
    HttpResponse.json({ message: "All marked as read" }),
  ),

  // General Settings
  http.get("*/api/admin/config/general", () =>
    HttpResponse.json({
      setupCompleted: true,
      institutionName: "Université Hassan II",
    }),
  ),

  // ---- Admin endpoints for tests ----

  // Stats
  http.get("*/api/admin/stats", () =>
    HttpResponse.json({
      totalStudents: 100,
      totalTeachers: 20,
      totalDepartments: 5,
      totalRooms: 15,
      activeSessions: 3,
      upcomingDefenses: 8,
    }),
  ),

  // Audit logs (returns array — component uses `?? []`)
  http.get("*/api/admin/audit-logs", () =>
    HttpResponse.json([
      {
        id: "1",
        action: "LOGIN",
        entity: "user",
        entityId: "1",
        adminEmail: "admin@univh2c.ma",
        details: "Connexion admin",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        action: "CREATE",
        entity: "room",
        entityId: "2",
        adminEmail: "admin@univh2c.ma",
        details: "Création salle S101",
        timestamp: new Date().toISOString(),
      },
    ]),
  ),

  // Users
  http.get("*/api/admin/users", () =>
    HttpResponse.json({
      items: [
        { id: "1", lastName: "Admin", firstName: "User", email: "admin@univh2c.ma", role: "admin", isActive: true },
        { id: "2", lastName: "Coord", firstName: "User", email: "coord@univh2c.ma", role: "coordinator", isActive: true },
        { id: "3", lastName: "Teacher", firstName: "User", email: "teacher@univh2c.ma", role: "teacher", isActive: true },
        { id: "4", lastName: "Student", firstName: "User", email: "student@univh2c.ma", role: "student", isActive: true },
      ],
      total: 4,
      pageCount: 1,
    }),
  ),

  // Students
  http.get("*/api/admin/students", () =>
    HttpResponse.json({
      items: [
        { id: "1", cne: "CNE001", lastName: "Dupont", firstName: "Jean", email: "jean.dupont@example.com", majorId: "m1", levelId: "l1", isActive: true, role: "student" },
        { id: "2", cne: "CNE002", lastName: "Martin", firstName: "Sophie", email: "sophie.martin@example.com", majorId: "m2", levelId: "l2", isActive: false, role: "student" },
      ],
      total: 2,
      pageCount: 1,
    }),
  ),

  // Teachers
  http.get("*/api/admin/teachers", () =>
    HttpResponse.json({
      items: [
        { id: "t1", lastName: "Benali", firstName: "Ahmed", email: "ahmed.benali@example.com", departmentId: "d1", isActive: true, role: "teacher" },
        { id: "t2", lastName: "Amrani", firstName: "Fatima", email: "fatima.amrani@example.com", departmentId: "d2", isActive: false, role: "teacher" },
      ],
      total: 2,
      pageCount: 1,
    }),
  ),

  // Coordinators
  http.get("*/api/admin/coordinators", () =>
    HttpResponse.json({
      items: [
        { id: "c1", lastName: "Idrissi", firstName: "Hassan", email: "hassan.idrissi@example.com", isActive: true, role: "coordinator" },
        { id: "c2", lastName: "El Fassi", firstName: "Nadia", email: "nadia.elfassi@example.com", isActive: false, role: "coordinator" },
      ],
      total: 2,
      pageCount: 1,
    }),
  ),

  // Departments
  http.get("*/api/admin/departments", () =>
    HttpResponse.json([
      { id: "d1", name: "Informatique", code: "INFO", headId: "t1" },
      { id: "d2", name: "Mathématiques", code: "MATH", headId: "" },
    ]),
  ),

  // Rooms
  http.get("*/api/admin/rooms", () =>
    HttpResponse.json([
      { id: "r1", name: "Salle 101", capacity: 30, departmentId: "d1" },
      { id: "r2", name: "Salle 102", capacity: 20, departmentId: "d2" },
    ]),
  ),

  // Config: Majors
  http.get("*/api/admin/config/majors", () =>
    HttpResponse.json([
      { id: "m1", name: "Génie Informatique" },
      { id: "m2", name: "Génie Civil" },
    ]),
  ),

  // Config: Levels
  http.get("*/api/admin/config/levels", () =>
    HttpResponse.json([
      { id: "l1", name: "L3" },
      { id: "l2", name: "M1" },
    ]),
  ),

  // Config: Email
  http.get("*/api/admin/config/email", () =>
    HttpResponse.json({
      host: "smtp.example.com",
      port: 587,
      username: "test@example.com",
      password: "secret",
      senderName: "Université",
      senderEmail: "noreply@example.com",
      encryption: "tls",
    }),
  ),

  // Update email config
  http.put("*/api/admin/config/email", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Create user
  http.post("*/api/admin/users", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: "new-id", ...body, isActive: false } as Record<string, unknown>,
      { status: 201 },
    );
  }),

  // Update user
  http.put("*/api/admin/users/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Delete user
  http.delete("*/api/admin/users/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Create department
  http.post("*/api/admin/departments", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-dept", ...body as Record<string, unknown> }, { status: 201 });
  }),

  // Update department
  http.put("*/api/admin/departments/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Delete department
  http.delete("*/api/admin/departments/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Create room
  http.post("*/api/admin/rooms", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-room", ...body as Record<string, unknown> }, { status: 201 });
  }),

  // Update room
  http.put("*/api/admin/rooms/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // Delete room
  http.delete("*/api/admin/rooms/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Bulk create users
  http.post("*/api/admin/users/bulk", async ({ request }) => {
    const body = (await request.json()) as { users: Record<string, string | number>[]; role: string };
    return HttpResponse.json(
      body.users.map((u, i) => ({ id: `bulk-${i}`, ...u, role: body.role, isActive: false })),
      { status: 201 },
    );
  }),

  // Bulk create rooms
  http.post("*/api/admin/rooms/bulk", async ({ request }) => {
    const body = (await request.json()) as { rooms: Record<string, string | number>[] };
    return HttpResponse.json(
      body.rooms.map((r, i) => ({ id: `bulk-room-${i}`, ...r })),
      { status: 201 },
    );
  }),

  // Config CRUD: Majors
  http.post("*/api/admin/config/majors", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-major", ...body as Record<string, unknown> }, { status: 201 });
  }),
  http.put("*/api/admin/config/majors/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
  http.delete("*/api/admin/config/majors/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Config CRUD: Levels
  http.post("*/api/admin/config/levels", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-level", ...body as Record<string, unknown> }, { status: 201 });
  }),
  http.put("*/api/admin/config/levels/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
  http.delete("*/api/admin/config/levels/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),
];
