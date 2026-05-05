import type { ElementType } from "react";

export type UserRole = "ADMIN" | "COORDINATOR" | "TEACHER" | "STUDENT";
export type SessionStatus = "OUVERTE" | "VERROUILLEE" | "CLOTUREE";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
}

export interface Room {
  id: number;
  nom: string;
  batiment: string;
  capacite: number;
  disponible: boolean;
}

export interface GlobalSession {
  id: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: SessionStatus;
}

export interface AdminStatMetric {
	title: string;
	value: string;
	icon: ElementType;
	bg: string;
}

export interface UniversitySettings {
	name: string;
	logoUrl: string;
	defenseSlots: string[];
}
