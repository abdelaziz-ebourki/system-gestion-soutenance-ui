export type UserRole = "admin" | "coordinator" | "teacher" | "student";

export interface User {
	id: string;
	lastName: string;
	firstName: string;
	email: string;
	role: UserRole;
	isActive: boolean;
	password?: string;
}

export interface Filiere {
	id: string;
	name: string;
}

export interface Level {
	id: string;
	name: string;
}

export interface Grade {
	id: string;
	name: string;
}

export interface Student extends User {
	role: "student";
	cne: string;
	filiereId: string;
	levelId: string;
	projectId?: string;
}

export interface Teacher extends User {
	role: "teacher";
	gradeId: string;
	departmentId: string;
}

export interface Coordinator extends User {
	role: "coordinator";
}

export interface Department {
	id: string;
	name: string;
	code: string;
	headId: string;
}

export interface Session {
	id: string;
	name: string;
	type: string;
	status: "active" | "draft" | "archived";
	startDate: string;
	endDate: string;
}

export interface Room {
	id: string;
	name: string;
	capacity: number;
	building: string;
}

export const BUILDINGS = ["Bloc A", "Bloc B", "Bloc C", "Amphi"] as const;
