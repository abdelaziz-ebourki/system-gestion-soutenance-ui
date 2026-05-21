import type { DbProject, DbProjectStudent } from "./schema";

export const projects: DbProject[] = [
  {
    id: "p1", title: "Systeme de Gestion des Soutenances",
    description: "Plateforme de planification, notifications et suivi des jurys.",
    supervisorId: "3", status: "approved",
  },
  {
    id: "p2", title: "Application E-learning adaptative",
    description: "Personnalisation des parcours selon les performances.",
    supervisorId: "4", status: "pending",
  },
  {
    id: "p3", title: "Analyse des donnees IoT",
    description: "Pipeline d'agregation et tableau de bord temps reel.",
    supervisorId: "3", status: "approved",
  },
  {
    id: "p4", title: "Securite des reseaux cloud",
    description: "Detection d'anomalies et gouvernance des acces.",
    supervisorId: "4", status: "approved",
  },
  {
    id: "p5", title: "Portail intelligent de suivi des soutenances",
    description: "Interface et services pour suivre planning, documents et evaluations.",
    supervisorId: "3", status: "approved",
  },
];

export const projectStudents: DbProjectStudent[] = [
  { projectId: "p1", studentId: "std-1" },
  { projectId: "p1", studentId: "std-2" },
  { projectId: "p2", studentId: "std-3" },
  { projectId: "p3", studentId: "std-4" },
  { projectId: "p3", studentId: "std-5" },
  { projectId: "p4", studentId: "std-6" },
  { projectId: "p5", studentId: "std-1" },
  { projectId: "p5", studentId: "std-2" },
];
