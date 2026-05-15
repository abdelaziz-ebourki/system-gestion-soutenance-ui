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
	Project,
	Jury,
	TeacherDefense,
	TeacherEvaluation,
	TeacherStats,
	TeacherUnavailability,
	StudentStats,
	StudentDefenseDetails,
	StudentGroupDetails,
	StudentGroupWorkspace,
	StudentDocument,
} from "@/types";
import { auditLogHandlers } from "./audit-log-handlers";

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

const firstNames = [
	"Amine", "Salma", "Yassine", "Fatima", "Mehdi", "Sofia", "Omar", "Hajar", "Khalid", "Layla",
	"Zakaria", "Nadia", "Hamza", "Zineb", "Anas", "Meryem", "Reda", "Chaimae", "Ayoub", "Ibtissam"
];
const lastNames = [
	"Alami", "Benali", "Fassi", "Tazi", "Mansouri", "Radi", "Idrissi", "Bennani", "Kettani", "Amrani",
	"Lahlou", "Sekkat", "Guessous", "Filali", "Skalli", "Kadiri", "Belkora", "Mernissi", "Berrada", "El Hachimi"
];

// Helper to generate lots of mock students for pagination testing
const generateStudents = (count: number): Student[] => {
	return Array.from({ length: count }, (_, i) => ({
		id: `std-${i + 1}`,
		lastName: lastNames[i % lastNames.length],
		firstName: firstNames[i % firstNames.length],
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
	{
		id: "std-demo",
		lastName: "Bourki",
		firstName: "Salma",
		email: "student@univ.com",
		password: "1234",
		role: "student",
		isActive: true,
		cne: "E13000999",
		filiereId: "f1",
		levelId: "n2",
	} as Student,
	...generateStudents(50),
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

let defenseSettings = {
	startTime: "08:00",
	endTime: "18:00",
	defenseDuration: 30,
	breakDuration: 15,
	groupCreationStartDate: "2026-05-01",
	groupCreationEndDate: "2026-06-20",
};

let mockProjects: Project[] = [
	{
		id: "p1",
		title: "Systeme de Gestion des Soutenances",
		description: "Plateforme de planification, notifications et suivi des jurys.",
		studentIds: ["std-1", "std-2"],
		studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
		supervisorId: "3",
		supervisorName: "Ali Ben Ali",
		status: "approved",
	},
	{
		id: "p2",
		title: "Application E-learning adaptative",
		description: "Personnalisation des parcours selon les performances.",
		studentIds: ["std-3"],
		studentNames: ["Nom3 Prenom3"],
		supervisorId: "4",
		supervisorName: "Alami Moussa",
		status: "pending",
	},
	{
		id: "p3",
		title: "Analyse des donnees IoT",
		description: "Pipeline d'agregation et tableau de bord temps reel.",
		studentIds: ["std-4", "std-5"],
		studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"],
		supervisorId: "3",
		supervisorName: "Ali Ben Ali",
		status: "approved",
	},
	{
		id: "p4",
		title: "Securite des reseaux cloud",
		description: "Detection d'anomalies et gouvernance des acces.",
		studentIds: ["std-6"],
		studentNames: ["Nom6 Prenom6"],
		supervisorId: "4",
		supervisorName: "Alami Moussa",
		status: "approved",
	},
	{
		id: "p5",
		title: "Portail intelligent de suivi des soutenances",
		description: "Interface et services pour suivre planning, documents et evaluations.",
		studentIds: ["std-1", "std-2"],
		studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
		supervisorId: "3",
		supervisorName: "Ali Ben Ali",
		status: "approved",
	},
];

let mockJurys: Jury[] = [
	{
		id: "j1",
		projectId: "p1",
		projectTitle: "Systeme de Gestion des Soutenances",
		presidentId: "3",
		presidentName: "Ali Ben Ali",
		reporterId: "4",
		reporterName: "Alami Moussa",
		examinerId: "2",
		examinerName: "Ouchen Yassin",
	},
	{
		id: "j2",
		projectId: "p3",
		projectTitle: "Analyse des donnees IoT",
		presidentId: "4",
		presidentName: "Alami Moussa",
		reporterId: "3",
		reporterName: "Ali Ben Ali",
		examinerId: "2",
		examinerName: "Ouchen Yassin",
	},
	{
		id: "j3",
		projectId: "p5",
		projectTitle: "Portail intelligent de suivi des soutenances",
		presidentId: "4",
		presidentName: "Alami Moussa",
		reporterId: "3",
		reporterName: "Ali Ben Ali",
		examinerId: "2",
		examinerName: "Ouchen Yassin",
	},
];

const teacherSchedule: TeacherDefense[] = [
	{
		id: "td1",
		projectId: "p1",
		projectTitle: "Systeme de Gestion des Soutenances",
		studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
		date: "2026-06-10",
		startTime: "08:30",
		endTime: "10:00",
		roomName: "Salle 101",
		role: "president",
		status: "scheduled",
	},
	{
		id: "td2",
		projectId: "p3",
		projectTitle: "Analyse des donnees IoT",
		studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"],
		date: "2026-06-11",
		startTime: "10:15",
		endTime: "11:45",
		roomName: "Amphi B",
		role: "reporter",
		status: "scheduled",
	},
	{
		id: "td3",
		projectId: "p4",
		projectTitle: "Securite des reseaux cloud",
		studentNames: ["Nom6 Prenom6"],
		date: "2026-06-07",
		startTime: "13:45",
		endTime: "15:15",
		roomName: "Labo Info",
		role: "supervisor",
		status: "completed",
	},
];

let teacherEvaluations: TeacherEvaluation[] = [
	{
		id: "te1",
		defenseId: "td1",
		projectTitle: "Systeme de Gestion des Soutenances",
		studentNames: ["Nom1 Prenom1", "Nom2 Prenom2"],
		role: "president",
		status: "pending",
	},
	{
		id: "te2",
		defenseId: "td2",
		projectTitle: "Analyse des donnees IoT",
		studentNames: ["Nom4 Prenom4", "Nom5 Prenom5"],
		role: "reporter",
		status: "pending",
	},
	{
		id: "te3",
		defenseId: "td3",
		projectTitle: "Securite des reseaux cloud",
		studentNames: ["Nom6 Prenom6"],
		role: "supervisor",
		score: 17,
		comment: "Presentation claire et demonstration solide.",
		status: "submitted",
		submittedAt: "2026-06-07T16:20:00Z",
	},
];

let teacherUnavailability: TeacherUnavailability = {
	slotsByDate: {
		"2026-06-09": ["10:15 - 11:45"],
		"2026-06-12": ["08:30 - 10:00", "10:15 - 11:45"],
	},
};

let studentGroups: Array<{
	id: string;
	groupName: string;
	memberIds: string[];
	projectId?: string;
}> = [
	{
		id: "sg1",
		groupName: "Groupe-1",
		memberIds: ["std-1", "std-2"],
		projectId: "p5",
	},
	{
		id: "sg2",
		groupName: "Groupe-2",
		memberIds: ["std-3"],
		projectId: "p2",
	},
];

const studentDocuments: StudentDocument[] = [
	{
		id: "sd1",
		name: "Rapport final.pdf",
		type: "Rapport",
		deadline: "2026-06-05",
		status: "validated",
		submittedAt: "2026-06-03 14:20",
	},
	{
		id: "sd2",
		name: "Presentation finale.pptx",
		type: "Presentation",
		deadline: "2026-06-10",
		status: "submitted",
		submittedAt: "2026-06-09 18:05",
	},
	{
		id: "sd3",
		name: "Code source.zip",
		type: "Archive",
		deadline: "2026-06-10",
		status: "missing",
	},
];

const currentStudentId = "std-demo";

const getUserFullName = (userId: string) => {
	const user = mockUsers.find((item) => item.id === userId);
	return user ? `${user.lastName} ${user.firstName}` : "Utilisateur inconnu";
};

const getStudentEmail = (studentId: string) => {
	const student = mockUsers.find((item) => item.id === studentId) as Student | undefined;
	return student?.email || "";
};

const getCurrentStudentGroup = () =>
	studentGroups.find((group) => group.memberIds.includes(currentStudentId)) || null;

const mapGroupDetails = (
	group: (typeof studentGroups)[number],
): StudentGroupDetails => {
	const project = group.projectId
		? mockProjects.find((item) => item.id === group.projectId)
		: undefined;

	return {
		id: group.id,
		groupName: group.groupName,
		projectTitle: project?.title,
		supervisorName: project?.supervisorName,
		members: group.memberIds.map((memberId) => ({
			id: memberId,
			fullName: getUserFullName(memberId),
			email: getStudentEmail(memberId),
			role: memberId === group.memberIds[0] ? "leader" : "member",
		})),
	};
};

const isGroupCreationOpen = () => {
	const today = "2026-05-15";
	return (
		today >= defenseSettings.groupCreationStartDate &&
		today <= defenseSettings.groupCreationEndDate
	);
};

const getStudentGroupWorkspace = (): StudentGroupWorkspace => {
	const currentGroup = getCurrentStudentGroup();

	return {
		currentGroup: currentGroup ? mapGroupDetails(currentGroup) : null,
		availableGroups: studentGroups
			.filter((group) => !group.memberIds.includes(currentStudentId))
			.map((group) => ({
				id: group.id,
				groupName: group.groupName,
				memberCount: group.memberIds.length,
			})),
		groupCreationStartDate: defenseSettings.groupCreationStartDate,
		groupCreationEndDate: defenseSettings.groupCreationEndDate,
		isGroupCreationOpen: isGroupCreationOpen(),
	};
};

const getStudentDefenseDetails = (): StudentDefenseDetails => {
	const currentGroup = getCurrentStudentGroup();
	const project = currentGroup?.projectId
		? mockProjects.find((item) => item.id === currentGroup.projectId)
		: undefined;
	const jury = project
		? mockJurys.find((item) => item.projectId === project.id)
		: undefined;

	if (!project) {
		return {
			projectTitle: "Aucun projet affecte",
			projectDescription:
				"Creez ou rejoignez un groupe pendant la periode autorisee pour demarrer votre dossier.",
			supervisorName: "En attente",
			juryMembers: [],
			status: "pending",
		};
	}

	return {
		projectTitle: project.title,
		projectDescription: project.description,
		supervisorName: project.supervisorName,
		juryMembers: jury
			? [
					{ name: jury.presidentName, role: "President" },
					{ name: jury.reporterName, role: "Rapporteur" },
					{ name: jury.examinerName, role: "Examinateur" },
				]
			: [],
		date: project.id === "p5" ? "2026-06-14" : undefined,
		startTime: project.id === "p5" ? "10:15" : undefined,
		endTime: project.id === "p5" ? "11:45" : undefined,
		roomName: project.id === "p5" ? "Salle 101" : undefined,
		status: project.id === "p5" ? "scheduled" : "pending",
		convocationUrl: project.id === "p5" ? "/api/student/convocation" : undefined,
	};
};

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

	http.post("/api/admin/rooms/bulk", async ({ request }) => {
		await delay(MOCK_DELAY);
		const { rooms } = (await request.json()) as { rooms: any[] };
		const createdRooms: Room[] = rooms.map((r) => ({
			id: Math.random().toString(36).substr(2, 9),
			name: r.name,
			building: r.building,
			capacity: Number(r.capacity),
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
	http.get("/api/admin/config/settings", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(defenseSettings);
	}),
	http.post("/api/admin/config/settings", async ({ request }) => {
		await delay(MOCK_DELAY);
		const body = (await request.json()) as Partial<typeof defenseSettings>;
		defenseSettings = { ...defenseSettings, ...body };
		return HttpResponse.json(defenseSettings);
	}),
	...auditLogHandlers,
	// Coordinator Stats
	http.get("/api/coordinator/stats", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json({
			totalProjects: mockProjects.length,
			totalGroups: mockProjects.length,
			totalJuries: mockJurys.length,
			scheduledDefenses: 6,
		});
	}),

	// Projects
	http.get("/api/coordinator/projects", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(mockProjects);
	}),
	http.post("/api/coordinator/projects", async ({ request }) => {
		await delay(MOCK_DELAY);
		const body = (await request.json()) as Omit<Project, "id">;
		const newProject: Project = {
			...body,
			id: `p${mockProjects.length + 1}`,
		};
		mockProjects = [newProject, ...mockProjects];
		return HttpResponse.json(newProject, { status: 201 });
	}),
	http.put("/api/coordinator/projects/:id", async ({ params, request }) => {
		await delay(MOCK_DELAY);
		const { id } = params;
		const body = (await request.json()) as Partial<Project>;
		const index = mockProjects.findIndex((project) => project.id === id);
		if (index === -1) {
			return new HttpResponse(null, { status: 404 });
		}
		mockProjects[index] = { ...mockProjects[index], ...body };
		return HttpResponse.json(mockProjects[index]);
	}),
	http.delete("/api/coordinator/projects/:id", async ({ params }) => {
		await delay(MOCK_DELAY);
		const { id } = params;
		mockProjects = mockProjects.filter((project) => project.id !== id);
		mockJurys = mockJurys.filter((jury) => jury.projectId !== id);
		return new HttpResponse(null, { status: 204 });
	}),

	http.get("/api/coordinator/jurys", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(mockJurys);
	}),
	http.post("/api/coordinator/jurys", async ({ request }) => {
		await delay(MOCK_DELAY);
		const body = (await request.json()) as Omit<Jury, "id">;
		const newJury: Jury = {
			...body,
			id: `j${mockJurys.length + 1}`,
		};
		mockJurys = [newJury, ...mockJurys];
		return HttpResponse.json(newJury, { status: 201 });
	}),

	// Schedule
	http.post("/api/coordinator/schedule", async ({ request }) => {
		await delay(MOCK_DELAY);
		const body = await request.json();
		console.log("Schedule saved:", body);
		return HttpResponse.json({ message: "Schedule saved successfully" });
	}),

	http.get("/api/teacher/stats", async () => {
		await delay(MOCK_DELAY);
		const pendingEvaluations = teacherEvaluations.filter(
			(evaluation) => evaluation.status === "pending",
		).length;
		const upcomingDefenses = teacherSchedule.filter(
			(defense) => defense.status === "scheduled",
		).length;
		const juryAssignments = teacherSchedule.filter(
			(defense) => defense.role !== "supervisor",
		).length;
		const declaredUnavailabilitySlots = Object.values(
			teacherUnavailability.slotsByDate,
		).reduce((total, slots) => total + slots.length, 0);

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
		return HttpResponse.json(teacherSchedule);
	}),

	http.get("/api/teacher/evaluations", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(teacherEvaluations);
	}),

	http.post("/api/teacher/evaluations/:id", async ({ params, request }) => {
		await delay(MOCK_DELAY);
		const { id } = params;
		const body = (await request.json()) as Pick<
			TeacherEvaluation,
			"score" | "comment"
		>;
		const index = teacherEvaluations.findIndex((evaluation) => evaluation.id === id);

		if (index === -1) {
			return new HttpResponse(null, { status: 404 });
		}

		teacherEvaluations[index] = {
			...teacherEvaluations[index],
			...body,
			status: "submitted",
			submittedAt: new Date().toISOString(),
		};

		return HttpResponse.json(teacherEvaluations[index]);
	}),

	http.get("/api/teacher/unavailability", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(teacherUnavailability);
	}),

	http.post("/api/teacher/unavailability", async ({ request }) => {
		await delay(MOCK_DELAY);
		const body = (await request.json()) as TeacherUnavailability;
		teacherUnavailability = body;
		return HttpResponse.json(teacherUnavailability);
	}),

	http.get("/api/student/stats", async () => {
		await delay(MOCK_DELAY);
		const groupWorkspace = getStudentGroupWorkspace();
		const currentDefense = getStudentDefenseDetails();
		const stats: StudentStats = {
			documentCount: studentDocuments.length,
			missingDocuments: studentDocuments.filter(
				(document) => document.status === "missing",
			).length,
			groupMembers: groupWorkspace.currentGroup?.members.length || 0,
			defenseStatus: currentDefense.status,
		};
		return HttpResponse.json(stats);
	}),

	http.get("/api/student/defense", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(getStudentDefenseDetails());
	}),

	http.get("/api/student/group", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(getStudentGroupWorkspace());
	}),

	http.post("/api/student/group", async () => {
		await delay(MOCK_DELAY);

		if (!isGroupCreationOpen()) {
			return HttpResponse.json(
				{
					message:
						"La creation de groupe n'est pas autorisee en dehors de la periode configuree.",
				},
				{ status: 400 },
			);
		}

		if (getCurrentStudentGroup()) {
			return HttpResponse.json(
				{ message: "Vous appartenez deja a un groupe pour cette session." },
				{ status: 400 },
			);
		}

		const nextGroupNumber =
			studentGroups.length > 0
				? Math.max(
						...studentGroups.map((group) =>
							Number.parseInt(group.groupName.replace("Groupe-", ""), 10),
						),
					) + 1
				: 1;
		const newGroup = {
			id: `sg${studentGroups.length + 1}`,
			groupName: `Groupe-${nextGroupNumber}`,
			memberIds: [currentStudentId],
		};
		studentGroups = [...studentGroups, newGroup];
		return HttpResponse.json(mapGroupDetails(newGroup), { status: 201 });
	}),

	http.post("/api/student/group/:id/join", async ({ params }) => {
		await delay(MOCK_DELAY);
		const { id } = params;

		if (!isGroupCreationOpen()) {
			return HttpResponse.json(
				{
					message:
						"Vous ne pouvez pas rejoindre un groupe en dehors de la periode configuree.",
				},
				{ status: 400 },
			);
		}

		if (getCurrentStudentGroup()) {
			return HttpResponse.json(
				{ message: "Vous appartenez deja a un groupe pour cette session." },
				{ status: 400 },
			);
		}

		const group = studentGroups.find((item) => item.id === id);
		if (!group) {
			return new HttpResponse(null, { status: 404 });
		}

		group.memberIds.push(currentStudentId);
		return HttpResponse.json(mapGroupDetails(group));
	}),

	http.get("/api/student/documents", async () => {
		await delay(MOCK_DELAY);
		return HttpResponse.json(studentDocuments);
	}),

	http.get("/api/student/convocation", async () => {
		await delay(MOCK_DELAY);
		const defense = getStudentDefenseDetails();

		if (!defense.convocationUrl) {
			return HttpResponse.json(
				{ message: "Aucune convocation n'est disponible pour le moment." },
				{ status: 404 },
			);
		}

		const content = [
			"CONVOCATION DE SOUTENANCE",
			`Projet: ${defense.projectTitle}`,
			`Date: ${defense.date}`,
			`Horaire: ${defense.startTime} - ${defense.endTime}`,
			`Salle: ${defense.roomName}`,
			`Encadrant: ${defense.supervisorName}`,
		].join("\n");

		return new HttpResponse(content, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": 'attachment; filename="convocation-soutenance.pdf"',
			},
		});
	}),
];
