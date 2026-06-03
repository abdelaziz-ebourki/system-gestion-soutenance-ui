import { http, HttpResponse } from "msw";

export const handlers = [
  // ── Auth ──
  http.post("*/api/auth/login", async ({ request }) => {
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

  // ── Notifications ──
  http.get("*/api/notifications", () =>
    HttpResponse.json([
      {
        id: "1",
        type: "info",
        title: "Notification test",
        message: "Ceci est une notification de test",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]),
  ),

  http.patch("*/api/notifications/:id/read", () =>
    HttpResponse.json({ message: "Marked as read" }),
  ),

  http.patch("*/api/notifications/read-all", () =>
    HttpResponse.json({ message: "All marked as read" }),
  ),

  // ── Admin ──

  // General Settings
  http.get("*/api/admin/config/general", () =>
    HttpResponse.json({
      setupCompleted: true,
      institutionName: "Université Hassan II",
    }),
  ),

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

  // Audit logs
  http.get("*/api/admin/audit-logs", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const allItems = [
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
    ];
    const start = page * limit;
    const items = allItems.slice(start, start + limit);
    return HttpResponse.json({
      items,
      total: allItems.length,
      pageCount: Math.ceil(allItems.length / limit),
    });
  }),

  // Users
  http.get("*/api/admin/users", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "0");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const allItems = [
      { id: "1", lastName: "Admin", firstName: "User", email: "admin@univh2c.ma", role: "admin", isActive: true },
      { id: "2", lastName: "Coord", firstName: "User", email: "coord@univh2c.ma", role: "coordinator", isActive: true },
      { id: "3", lastName: "Teacher", firstName: "User", email: "teacher@univh2c.ma", role: "teacher", isActive: true },
      { id: "4", lastName: "Student", firstName: "User", email: "student@univh2c.ma", role: "student", isActive: true },
    ];
    const filtered = search
      ? allItems.filter(
          (u) =>
            u.lastName.toLowerCase().includes(search) ||
            u.firstName.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search),
        )
      : allItems;
    const start = page * limit;
    const items = filtered.slice(start, start + limit);
    return HttpResponse.json({
      items,
      total: filtered.length,
      pageCount: Math.ceil(filtered.length / limit),
    });
  }),

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

  // Config: Jury Role Templates
  http.get("*/api/admin/config/jury-role-templates", () =>
    HttpResponse.json([
      {
        id: "t1",
        name: "Standard PFE",
        defenseType: "pfe",
        roles: [
          { name: "President", count: 1, coefficient: 2 },
          { name: "Rapporteur", count: 1, coefficient: 1.5 },
          { name: "Examinateur", count: 1, coefficient: 1 },
        ],
      },
    ]),
  ),

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

  // ── Coordinator: Stats ──
  http.get("*/api/coordinator/stats", () =>
    HttpResponse.json({
      totalProjects: 12,
      totalGroups: 8,
      totalJuries: 6,
      scheduledDefenses: 4,
    }),
  ),

  // ── Coordinator: Projects ──
  http.get("*/api/coordinator/projects", () =>
    HttpResponse.json([
      {
        id: "p1",
        title: "Application CI/CD",
        description: "Pipeline d'intégration continue",
        studentIds: ["s1", "s2"],
        studentNames: ["Jean Dupont", "Sophie Martin"],
        supervisorId: "t1",
        supervisorName: "Ahmed Benali",
        defenseType: "pfe",
        status: "approved",
      },
      {
        id: "p2",
        title: "Analyse des données",
        description: "Traitement et visualisation",
        studentIds: ["s3"],
        studentNames: ["Amine El Idrissi"],
        supervisorId: "t2",
        supervisorName: "Fatima Amrani",
        defenseType: "memoire",
        status: "pending",
      },
    ]),
  ),

  http.post("*/api/coordinator/projects", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "new-project", ...body as Record<string, unknown> },
      { status: 201 },
    );
  }),

  http.put("*/api/coordinator/projects/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  http.delete("*/api/coordinator/projects/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.post("*/api/coordinator/projects/:id/assign-group", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: ":id", ...body as Record<string, unknown> });
  }),

  // ── Coordinator: Groups ──
  http.get("*/api/coordinator/groups", () =>
    HttpResponse.json([
      {
        id: "g1",
        projectId: "p1",
        studentIds: ["s1", "s2"],
        sessionId: "ds1",
      },
    ]),
  ),

  http.post("*/api/coordinator/groups", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "new-group", ...body as Record<string, unknown> },
      { status: 201 },
    );
  }),

  http.delete("*/api/coordinator/groups/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // ── Coordinator: Student Groups ──
  http.get("*/api/coordinator/student-groups", () =>
    HttpResponse.json([
      {
        id: "sg1",
        groupName: "Groupe Alpha",
        memberNames: ["Jean Dupont", "Sophie Martin", "Amine El Idrissi"],
        memberCount: 3,
        projectId: "p1",
        projectTitle: "Application CI/CD",
      },
      {
        id: "sg2",
        groupName: "Groupe Beta",
        memberNames: ["Sarah Benali"],
        memberCount: 1,
        projectId: null,
      },
    ]),
  ),

  // ── Coordinator: Juries ──
  http.get("*/api/coordinator/juries", () =>
    HttpResponse.json([
      {
        id: "j1",
        projectId: "p1",
        projectTitle: "Application CI/CD",
        studentNames: ["Jean Dupont", "Sophie Martin"],
        defenseType: "pfe",
        templateId: "t1",
        templateName: "Standard PFE",
        members: [
          { roleName: "President", teacherId: "t1", teacherName: "Ahmed Benali" },
          { roleName: "Rapporteur", teacherId: "t2", teacherName: "Fatima Amrani" },
        ],
      },
    ]),
  ),

  http.post("*/api/coordinator/juries", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "new-jury", ...body as Record<string, unknown> },
      { status: 201 },
    );
  }),

  http.put("*/api/coordinator/juries/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  http.delete("*/api/coordinator/juries/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // ── Coordinator: Defense Sessions ──
  http.get("*/api/coordinator/defense-sessions", () =>
    HttpResponse.json([
      {
        id: "ds1",
        name: "Session PFE 2026",
        defenseType: "pfe",
        status: "active",
        maxGroupSize: 3,
        defenseDuration: 60,
        breakDuration: 15,
        submissionDeadline: "2026-06-01",
        evaluationCoefficients: { President: 2, Rapporteur: 1.5, Examinateur: 1 },
        juryRoleTemplateId: "t1",
        startDate: "2026-06-15",
        endDate: "2026-06-30",
        startTime: "08:00",
        endTime: "18:00",
      },
      {
        id: "ds2",
        name: "Session Mémoire 2026",
        defenseType: "memoire",
        status: "draft",
        maxGroupSize: 2,
        defenseDuration: 45,
        breakDuration: 10,
        submissionDeadline: "2026-07-01",
        evaluationCoefficients: { President: 2, Rapporteur: 1.5 },
        juryRoleTemplateId: "t1",
        startDate: "2026-07-10",
        endDate: "2026-07-25",
        startTime: "09:00",
        endTime: "17:00",
      },
    ]),
  ),

  http.post("*/api/coordinator/defense-sessions", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: "new-session", ...body as Record<string, unknown> },
      { status: 201 },
    );
  }),

  http.put("*/api/coordinator/defense-sessions/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  http.delete("*/api/coordinator/defense-sessions/:id", () =>
    new HttpResponse(null, { status: 204 }),
  ),

  http.post("*/api/coordinator/defense-sessions/:id/transition", async ({ request }) => {
    const body = (await request.json()) as { toStatus?: string };
    return HttpResponse.json({ id: ":id", status: body.toStatus ?? "active" });
  }),

  // ── Coordinator: Schedule ──
  http.get("*/api/coordinator/schedule", () =>
    HttpResponse.json({
      "2026-06-15_08:00": { id: "sl1", projectId: "p1", slot: "08:00", date: "2026-06-15", roomId: "r1" },
      "2026-06-15_09:00": { id: "sl2", projectId: "p2", slot: "09:00", date: "2026-06-15", roomId: "r2" },
    }),
  ),

  http.post("*/api/coordinator/schedule", () =>
    HttpResponse.json({ message: "Schedule saved" }),
  ),

  // ── Coordinator: Unavailability ──
  http.get("*/api/coordinator/unavailability", () =>
    HttpResponse.json([
      {
        id: "u1",
        teacherId: "t1",
        date: "2026-06-10",
        slots: ["08:00-09:00", "09:00-10:00"],
      },
    ]),
  ),

  // ── Coordinator: Grades ──
  http.get("*/api/coordinator/grades", () =>
    HttpResponse.json([
      {
        projectId: "p1",
        projectTitle: "Application CI/CD",
        defenseDate: "2026-06-15",
        status: "completed",
        finalScore: 16.5,
        evaluationCoefficients: { President: 2, Rapporteur: 1.5 },
        individualScores: [
          { roleName: "President", teacherName: "Ahmed Benali", score: 17 },
          { roleName: "Rapporteur", teacherName: "Fatima Amrani", score: 16 },
        ],
      },
      {
        projectId: "p2",
        projectTitle: "Analyse des données",
        defenseDate: null,
        status: "pending",
        finalScore: null,
        evaluationCoefficients: { President: 2, Rapporteur: 1.5 },
        individualScores: [],
      },
    ]),
  ),

  // ── Coordinator: Documents ──
  http.post("*/api/coordinator/documents/evaluation-sheets", () =>
    HttpResponse.json({
      settings: { institutionName: "Université Hassan II", institutionLogoUrl: "", timezone: "Africa/Casablanca", dateFormat: "DD/MM/YYYY", setupCompleted: true },
      grade: { projectId: "p1", projectTitle: "Application CI/CD", status: "completed", finalScore: 16.5, evaluationCoefficients: {}, individualScores: [] },
      studentNames: ["Jean Dupont", "Sophie Martin"],
    }),
  ),

  http.post("*/api/coordinator/documents/attendance-lists", () =>
    HttpResponse.json({
      defenseSessionName: "Session PFE 2026",
      slots: [
        { date: "2026-06-15", time: "08:00", roomName: "Salle 101", projectTitle: "Application CI/CD", studentNames: ["Jean Dupont", "Sophie Martin"] },
      ],
    }),
  ),

  http.post("*/api/coordinator/documents/jury-convocations", () =>
    HttpResponse.json([
      { teacherName: "Ahmed Benali", role: "President", projectTitle: "Application CI/CD", studentNames: ["Jean Dupont", "Sophie Martin"], date: "2026-06-15", time: "08:00", roomName: "Salle 101", defenseSessionName: "Session PFE 2026" },
    ]),
  ),

  http.post("*/api/coordinator/documents/schedule", () =>
    HttpResponse.json({
      defenseSessionName: "Session PFE 2026",
      slots: [
        { date: "2026-06-15", time: "08:00", roomName: "Salle 101", projectTitle: "Application CI/CD", studentNames: ["Jean Dupont", "Sophie Martin"] },
        { date: "2026-06-15", time: "09:00", roomName: "Salle 102", projectTitle: "Analyse des données", studentNames: ["Amine El Idrissi"] },
      ],
    }),
  ),

  http.post("*/api/coordinator/documents/proces-verbal", () =>
    HttpResponse.json({
      settings: { institutionName: "Université Hassan II", institutionLogoUrl: "", timezone: "Africa/Casablanca", dateFormat: "DD/MM/YYYY", setupCompleted: true },
      grade: { projectId: "p1", projectTitle: "Application CI/CD", status: "completed", finalScore: 16.5, evaluationCoefficients: {}, individualScores: [] },
      studentNames: ["Jean Dupont", "Sophie Martin"],
      supervisorName: "Ahmed Benali",
      juryMembers: [
        { roleName: "President", teacherName: "Ahmed Benali" },
        { roleName: "Rapporteur", teacherName: "Fatima Amrani" },
      ],
    }),
  ),

  // ── Teacher: Stats ──
  http.get("*/api/teacher/stats", () =>
    HttpResponse.json({
      upcomingDefenses: 5,
      pendingEvaluations: 3,
      declaredUnavailabilitySlots: 2,
      juryAssignments: 4,
    }),
  ),

  // ── Teacher: Schedule ──
  http.get("*/api/teacher/schedule", () =>
    HttpResponse.json([
      {
        id: "td1",
        projectId: "p1",
        projectTitle: "Application CI/CD",
        studentNames: ["Jean Dupont", "Sophie Martin"],
        date: "2026-06-15",
        startTime: "08:00",
        endTime: "09:00",
        roomName: "Salle 101",
        role: "president",
        status: "scheduled",
      },
      {
        id: "td2",
        projectId: "p2",
        projectTitle: "Analyse des données",
        studentNames: ["Amine El Idrissi"],
        date: "2026-06-16",
        startTime: "10:00",
        endTime: "11:00",
        roomName: "Salle 102",
        role: "reporter",
        status: "scheduled",
      },
    ]),
  ),

  // ── Teacher: Evaluations ──
  http.get("*/api/teacher/evaluations", () =>
    HttpResponse.json([
      {
        id: "te1",
        defenseId: "td1",
        projectTitle: "Application CI/CD",
        studentNames: ["Jean Dupont", "Sophie Martin"],
        role: "president",
        status: "pending",
      },
      {
        id: "te2",
        defenseId: "td2",
        projectTitle: "Analyse des données",
        studentNames: ["Amine El Idrissi"],
        role: "reporter",
        status: "submitted",
        score: 15,
        comment: "Bon travail",
        submittedAt: "2026-06-15T10:00:00Z",
      },
    ]),
  ),

  http.post("*/api/teacher/evaluations/:id", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: ":id",
      ...body as Record<string, unknown>,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
  }),

  // ── Teacher: Unavailability ──
  http.get("*/api/teacher/unavailability", () =>
    HttpResponse.json({
      slotsByDate: {
        "2026-06-10": ["08:00-09:00", "09:00-10:00"],
        "2026-06-11": ["14:00-15:00"],
      },
    }),
  ),

  http.post("*/api/teacher/unavailability", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),

  // ── Student: Stats ──
  http.get("*/api/student/stats", () =>
    HttpResponse.json({
      documentCount: 4,
      missingDocuments: 1,
      groupMembers: 3,
      defenseStatus: "scheduled",
    }),
  ),

  // ── Student: Defense ──
  http.get("*/api/student/defense", () =>
    HttpResponse.json({
      projectTitle: "Application CI/CD",
      projectDescription: "Pipeline d'intégration continue",
      supervisorName: "Ahmed Benali",
      juryMembers: [
        { name: "Ahmed Benali", role: "President" },
        { name: "Fatima Amrani", role: "Rapporteur" },
      ],
      date: "2026-06-15",
      startTime: "08:00",
      endTime: "09:00",
      roomName: "Salle 101",
      status: "scheduled",
      result: null,
    }),
  ),

  // ── Student: Group ──
  http.get("*/api/student/group", () =>
    HttpResponse.json({
      currentGroup: {
        id: "g1",
        groupName: "Groupe Alpha",
        projectTitle: "Application CI/CD",
        supervisorName: "Ahmed Benali",
        members: [
          { id: "s1", fullName: "Jean Dupont", email: "jean.dupont@example.com", role: "leader" },
          { id: "s2", fullName: "Sophie Martin", email: "sophie.martin@example.com", role: "member" },
        ],
      },
      availableGroups: [
        { id: "g2", groupName: "Groupe Beta", memberCount: 2 },
      ],
      groupCreationStartDate: "2026-01-01",
      groupCreationEndDate: "2026-06-01",
      isGroupCreationOpen: true,
    }),
  ),

  http.post("*/api/student/group", () =>
    HttpResponse.json(
      {
        id: "new-group",
        groupName: "Nouveau Groupe",
        members: [],
      },
      { status: 201 },
    ),
  ),

  http.post("*/api/student/group/:id/join", () =>
    HttpResponse.json(
      {
        id: ":id",
        groupName: "Groupe Rejoint",
        members: [],
      },
      { status: 201 },
    ),
  ),

  // ── Student: Documents ──
  http.get("*/api/student/documents", () =>
    HttpResponse.json([
      { id: "d1", name: "Rapport PFE", type: "report", deadline: "2026-06-01", status: "submitted", submittedAt: "2026-05-28T10:00:00Z" },
      { id: "d2", name: "Fiche de présentation", type: "presentation", deadline: "2026-06-05", status: "missing" },
      { id: "d3", name: "Déclaration sur l'honneur", type: "declaration", deadline: "2026-06-01", status: "validated", submittedAt: "2026-05-25T14:00:00Z" },
      { id: "d4", name: "Attestation de stage", type: "internship", deadline: "2026-06-01", status: "rejected", submittedAt: "2026-05-20T09:00:00Z" },
    ]),
  ),

  http.post("*/api/student/documents/:documentId/upload", async ({ request }) => {
    const body = await request.formData();
    const file = body.get("file") as File | null;
    return HttpResponse.json(
      {
        id: ":documentId",
        name: file?.name ?? "uploaded-file",
        type: "upload",
        deadline: "2026-06-01",
        status: "submitted",
        submittedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // ── Coordinator: Student documents review (mock) ──
  http.get("*/api/coordinator/student-documents", () =>
    HttpResponse.json([
      { id: "d1", name: "Rapport PFE", type: "report", deadline: "2026-06-01", status: "submitted", submittedAt: "2026-05-28T10:00:00Z", studentId: "s1", studentName: "Alice" },
      { id: "d2", name: "Fiche de présentation", type: "presentation", deadline: "2026-06-05", status: "submitted", studentId: "s2", studentName: "Bob" },
      { id: "d3", name: "Déclaration sur l'honneur", type: "declaration", deadline: "2026-06-01", status: "validated", submittedAt: "2026-05-25T14:00:00Z", studentId: "s3", studentName: "Charlie" },
    ]),
  ),

  http.post("*/api/coordinator/student-documents/:id/status", async ({ params, request }) => {
    const body = await request.json();
    const id = params.id as string;
    return HttpResponse.json({ id, status: body.status }, { status: 200 });
  }),

  // ── Student: Convocation ──
  http.get("*/api/student/convocation", () =>
    HttpResponse.json(new Blob(["mock-pdf-content"], { type: "application/pdf" })),
  ),
];
