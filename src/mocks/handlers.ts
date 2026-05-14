import { http, HttpResponse, delay } from "msw";
import type { User, Department, Session, Room } from "@/types";

const MOCK_DELAY = 1000;

const mockUsers: User[] = [
	{
		id: "1",
		email: "admin@univ.com",
		password: "password123",
		role: "admin",
		name: "Mohamed Ahmadi",
	},
	{
		id: "2",
		email: "coord@univ.com",
		password: "password123",
		role: "coordinator",
		name: "Yassin Ouchen",
	},
	{
		id: "3",
		email: "teacher@univ.com",
		password: "password123",
		role: "teacher",
		name: "Ali Ben Ali",
	},
	{
		id: "4",
		email: "student@univ.com",
		password: "password123",
		role: "student",
		name: "Sami El Alami",
	},
];

const mockDepartments: Department[] = [
	{ id: "1", name: "Informatique", code: "INFO", head: "Dr. Alami" },
	{ id: "2", name: "Mathématiques", code: "MATH", head: "Pr. Idrissi" },
	{ id: "3", name: "Physique", code: "PHYS", head: "Dr. Bennani" },
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
];
