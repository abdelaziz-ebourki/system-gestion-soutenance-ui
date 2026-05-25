import type { DbMajor, DbLevel, DbGrade, DbDefenseSettings, DbJuryRoleTemplate, DbFaculty } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const majors: DbMajor[] = [
  { id: "m1", name: "Informatique" },
  { id: "m2", name: "Mathématiques" },
  { id: "m3", name: "MI" },
  { id: "m4", name: "Physique Fondamentale" },
  { id: "m5", name: "Chimie" },
  { id: "m6", name: "Biologie Moléculaire" },
  { id: "m7", name: "Génie Civil" },
  { id: "m8", name: "Génie Mécanique" },
  { id: "m9", name: "Électronique" },
  { id: "m10", name: "Sciences de Gestion" },
];

export const levels: DbLevel[] = [
  { id: "l1", name: "L1" },
  { id: "l2", name: "L2" },
  { id: "l3", name: "L3" },
  { id: "m1", name: "M1" },
  { id: "m2", name: "M2" },
];

export const grades: DbGrade[] = [
  { id: "g1", name: "Professeur" },
  { id: "g2", name: "Maître de Conférences A" },
  { id: "g3", name: "Maître de Conférences B" },
  { id: "g4", name: "Maître Assistant A" },
  { id: "g5", name: "Maître Assistant B" },
];

export const juryRoleTemplates: DbJuryRoleTemplate[] = [
  {
    id: "jt1",
    name: "PFE Standard",
    defenseType: "pfe",
    roles: [
      { name: "Président", count: 1, coefficient: 30 },
      { name: "Rapporteur", count: 1, coefficient: 35 },
      { name: "Examinateur", count: 1, coefficient: 35 },
    ],
  },
  {
    id: "jt2",
    name: "Mémoire Standard",
    defenseType: "memoire",
    roles: [
      { name: "Président", count: 1, coefficient: 30 },
      { name: "Rapporteur", count: 1, coefficient: 35 },
      { name: "Examinateur", count: 1, coefficient: 35 },
    ],
  },
  {
    id: "jt3",
    name: "Thèse Standard",
    defenseType: "these",
    roles: [
      { name: "Président", count: 1, coefficient: 25 },
      { name: "Rapporteur", count: 2, coefficient: 25 },
      { name: "Examinateur", count: 1, coefficient: 25 },
    ],
  },
];

export const faculties: DbFaculty[] = [
  { id: "f1", name: "Faculté des Sciences Ben M'Sik", code: "FSBM", logoUrl: "" },
];

export const generalSettings = {
  institutionName: "Université Hassan II",
  institutionLogoUrl: "",
  timezone: "Africa/Casablanca",
  dateFormat: "DD/MM/YYYY",
  setupCompleted: false,
};

export const defenseTypeConfig = {
  pfe: { enabled: true, label: "Projet de Fin d'Études", labelPlural: "PFEs", defaultDuration: 30, defaultBreak: 15 },
  memoire: { enabled: true, label: "Mémoire", labelPlural: "Mémoires", defaultDuration: 20, defaultBreak: 10 },
  these: { enabled: true, label: "Thèse", labelPlural: "Thèses", defaultDuration: 45, defaultBreak: 15 },
};

export const documentConfig = {
  maxFileSizeMb: 50,
  allowedExtensions: "pdf,docx,pptx,xlsx,zip",
  versionLimit: 5,
};

export const emailConfig = {
  host: "smtp.univh2c.ma",
  port: 587,
  username: "noreply@soutenance.univh2c.ma",
  password: "",
  senderName: "FSBM Soutenance",
  senderEmail: "noreply@soutenance.univh2c.ma",
  encryption: "tls" as const,
};

export const defenseSettings: DbDefenseSettings = {
  startTime: "08:00",
  endTime: "18:00",
  defenseDuration: 30,
  breakDuration: 15,
  groupCreationStartDate: daysFromNow(-14),
  groupCreationEndDate: daysFromNow(14),
};
