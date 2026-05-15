export * from "./users-types";

export interface DashboardStats {
	totalStudents: number;
	totalTeachers: number;
	totalDepartments: number;
	totalRooms: number;
	activeSessions: number;
	upcomingDefenses: number;
}

export interface Project {
	id: string;
	title: string;
	description?: string;
	studentIds: string[];
	studentNames?: string[];
	supervisorId: string;
	supervisorName: string;
	status: "pending" | "approved" | "rejected";
}

export interface Group {
	id: string;
	projectId: string;
	studentIds: string[];
	sessionId: string;
}

export interface Jury {
	id: string;
	projectId: string;
	projectTitle: string;
	presidentId: string;
	presidentName: string;
	reporterId: string;
	reporterName: string;
	examinerId: string;
	examinerName: string;
}

export interface DefenseSlot {
	id: string;
	projectId: string;
	slot: string;
	date: string;
	roomId: string;
}

export interface TeacherStats {
	upcomingDefenses: number;
	pendingEvaluations: number;
	declaredUnavailabilitySlots: number;
	juryAssignments: number;
}

export interface TeacherDefense {
	id: string;
	projectId: string;
	projectTitle: string;
	studentNames: string[];
	date: string;
	startTime: string;
	endTime: string;
	roomName: string;
	role: "president" | "reporter" | "examiner" | "supervisor";
	status: "scheduled" | "completed";
}

export interface TeacherEvaluation {
	id: string;
	defenseId: string;
	projectTitle: string;
	studentNames: string[];
	role: "president" | "reporter" | "examiner" | "supervisor";
	score?: number;
	comment?: string;
	status: "pending" | "submitted";
	submittedAt?: string;
}

export interface TeacherUnavailability {
	slotsByDate: Record<string, string[]>;
}
