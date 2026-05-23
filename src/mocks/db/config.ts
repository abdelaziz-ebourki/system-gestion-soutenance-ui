import type { DbMajor, DbLevel, DbGrade, DbDefenseSettings, DbJuryRoleTemplate } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const majors: DbMajor[] = [];

export const levels: DbLevel[] = [];

export const grades: DbGrade[] = [];

export const juryRoleTemplates: DbJuryRoleTemplate[] = [];

export const generalSettings = {
  institutionName: "Université de Tlemcen",
  institutionLogoUrl: "",
  timezone: "Africa/Algiers",
  dateFormat: "DD/MM/YYYY",
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

export const defenseSettings: DbDefenseSettings = {
  startTime: "08:00",
  endTime: "18:00",
  defenseDuration: 30,
  breakDuration: 15,
  groupCreationStartDate: daysFromNow(-14),
  groupCreationEndDate: daysFromNow(14),
};
