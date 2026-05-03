import type { ElementType } from "react";

export interface Candidate {
	name: string;
	cne: string;
}

export interface DefenseSession {
	id: number;
	groupName: string;
	students: Candidate[];
	project: string;
	date: string;
	day: number;
	time: string;
	room: string;
	role: "Président" | "Rapporteur" | "Examinateur" | string;
	status: "Confirmé" | "En attente" | "Terminé" | string;
}

export interface StatMetric {
	title: string;
	value: string;
	icon: ElementType;
	bg: string;
}

export interface SupervisedProject {
	id: number;
	studentName: string;
	initials: string;
	filiere: string;
	projectTitle: string;
	progress: number;
}
