export interface User {
	id: string;
	email: string;
	password?: string;
	role: "admin" | "coordinator" | "teacher" | "student";
	name: string;
}

export interface Department {
	id: string;
	name: string;
	code: string;
	head: string;
}

export interface Session {
	id: string;
	name: string;
	type: string;
	status: string;
	startDate: string;
	endDate: string;
}

export interface Room {
	id: string;
	name: string;
	capacity: number;
	building: string;
}
