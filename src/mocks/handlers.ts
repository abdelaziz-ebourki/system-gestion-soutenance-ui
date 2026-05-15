import { http, HttpResponse, delay } from "msw";
import type {
	User,
	Department,
	Session,
	Room,
	Student,
	Teacher,
	Filiere,
	Level,
	Grade,
} from "@/types";

const MOCK_DELAY = 500;

const mockFilieres: Filiere[] = [
	{ id: "f1", name: "Génie Informatique" },
	{ id: "f2", name: "Génie Industriel" },
	{ id: "f3", name: "Génie Civil" },
	{ id: "f4", name: "Génie Électrique" },
	{ id: "f5", name: "Management" },
];

const mockLevels: Level[] = [
	{ id: "n1", name: "Licence" },
	{ id: "n2", name: "Master" },
	{ id: "n3", name: "Doctorat" },
];

const mockGrades: Grade[] = [
	{ id: "g1", name: "PES" },
	{ id: "g2", name: "PH" },
	{ id: "g3", name: "PA" },
];

// Helper to generate lots of mock students for pagination testing
const generateStudents = (count: number): Student[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `std-${i + 1}`,
		lastName: `Nom${i + 1}`,
		firstName: `Prenom${i + 1}`,
		email: `student${i + 1}@univ.com`,
		role: "student",
		isActive: true,
		cne: `E13000${i + 1}`,
		filiereId: mockFilieres[i % mockFilieres.length].id,
		levelId: mockLevels[i % mockLevels.length].id,
	}));
};

const mockUsers: User[] = [
	{
		id: "1",
		email: "admin@univ.com",
		password: "1234",
		role: "admin",
		lastName: "Ahmadi",
		firstName: "Mohamed",
		isActive: true,
	},
	{
		id: "2",
		email: "coord@univ.com",
		password: "1234",
		role: "coordinator",
		lastName: "Ouchen",
		firstName: "Yassin",
		isActive: true,
	},
	{
		id: "3",
		email: "teacher@univ.com",
		password: "1234",
		role: "teacher",
		lastName: "Ali",
		firstName: "Ben Ali",
		isActive: true,
		gradeId: "g1",
		departmentId: "1",
	} as Teacher,
	{
		id: "4",
		email: "moussa@univ.com",
		password: "1234",
		role: "teacher",
		lastName: "Alami",
		firstName: "Moussa",
		isActive: true,
		gradeId: "g2",
		departmentId: "2",
	} as Teacher,
	...generateStudents(20),
];

const mockDepartments: Department[] = [
	{ id: "1", name: "Informatique", code: "INFO", headId: "4" },
	{ id: "2", name: "Mathématiques", code: "MATH", headId: "3" },
	{ id: "3", name: "Physique", code: "PHYS", headId: "3" },
];

const mockSessions: Session[] = [
	{
		id: "1",
		name: "Session Normale 2026",
		type: "Normale",
		status: "active",
		startDate: "2026-06-01",
		endDate: "2026-06-30",
	},
	{
		id: "2",
		name: "Session Rattrapage 2026",
		type: "Rattrapage",
		status: "draft",
		startDate: "2026-09-01",
		endDate: "2026-09-15",
	},
];

const mockRooms: Room[] = [
	{ id: "1", name: "Salle 101", capacity: 30, building: "Bloc A" },
	{ id: "2", name: "Amphi B", capacity: 150, building: "Bloc B" },
	{ id: "3", name: "Labo Info", capacity: 20, building: "Bloc C" },
];

export const handlers = [
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
			const expiresIn = 60 * 60 * 1000 * 2; // 2 hours
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

	// Generalized User Fetcher with Pagination
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
			password: "", // No password yet
			isActive: false, // Inactive until verified
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
			users: any[];
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
				student.filiereId =
					mockFilieres.find((f) => f.name === u.filiereName)?.id || "f1";
				student.levelId =
					mockLevels.find((l) => l.name === u.levelName)?.id || "n1";
				return student;
			} else if (role === "teacher") {
				const teacher = newUser as Teacher;
				teacher.departmentId =
					mockDepartments.find((d) => d.name === u.departmentName)?.id || "1";
				teacher.gradeId =
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

	// Departments
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

	// Sessions
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

	// Rooms
	http.get("/api/admin/rooms", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(mockRooms);
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

	// Dashboard Stats
	http.get("/api/admin/stats", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json({
			totalStudents: mockUsers.filter((u) => u.role === "student").length,
			totalTeachers: mockUsers.filter((u) => u.role === "teacher").length,
			totalDepartments: mockDepartments.length,
			totalRooms: mockRooms.length,
			activeSessions: mockSessions.filter((s) => s.status === "active").length,
			upcomingDefenses: 12, // Mocked value
		});
	}),

	// Configuration Handlers
	http.get("/api/admin/config/filieres", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(mockFilieres);
	}),
	http.post("/api/admin/config/filieres", async ({ request }) => {
		const body = (await request.json()) as Omit<Filiere, "id">;
		const newItem = { ...body, id: `f${mockFilieres.length + 1}` };
		mockFilieres.push(newItem);
		return HttpResponse.json(newItem);
	}),
	http.put("/api/admin/config/filieres/:id", async ({ params, request }) => {
		const { id } = params;
		const body = (await request.json()) as Omit<Filiere, "id">;
		const idx = mockFilieres.findIndex((f) => f.id === id);
		if (idx === -1) return new HttpResponse(null, { status: 404 });
		mockFilieres[idx] = { ...mockFilieres[idx], ...body };
		return HttpResponse.json(mockFilieres[idx]);
	}),
	http.delete("/api/admin/config/filieres/:id", async ({ params }) => {
		const { id } = params;
		const idx = mockFilieres.findIndex((f) => f.id === id);
		if (idx === -1) return new HttpResponse(null, { status: 404 });
		mockFilieres.splice(idx, 1);
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
];
