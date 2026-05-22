import type { DbMajor, DbLevel, DbGrade, DbDefenseSettings, DbJuryRoleTemplate } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const majors: DbMajor[] = [
  { id: "f1", name: "Génie Informatique" },
  { id: "f2", name: "Génie Industriel" },
  { id: "f3", name: "Génie Civil" },
  { id: "f4", name: "Génie Électrique" },
  { id: "f5", name: "Management" },
];

export const levels: DbLevel[] = [
  { id: "n1", name: "Licence" },
  { id: "n2", name: "Master" },
  { id: "n3", name: "Doctorat" },
];

export const grades: DbGrade[] = [
  { id: "g1", name: "PES" },
  { id: "g2", name: "PH" },
  { id: "g3", name: "PA" },
];

export const juryRoleTemplates: DbJuryRoleTemplate[] = [
  {
    id: "jt1",
    name: "Standard 3 membres",
    roles: [
      { name: "Président", count: 1 },
      { name: "Rapporteur", count: 1 },
      { name: "Examinateur", count: 1 },
    ],
  },
  {
    id: "jt2",
    name: "Avec encadrant",
    roles: [
      { name: "Président", count: 1 },
      { name: "Rapporteur", count: 1 },
      { name: "Examinateur", count: 1 },
      { name: "Encadrant", count: 1 },
    ],
  },
];

export const defenseSettings: DbDefenseSettings = {
  startTime: "08:00",
  endTime: "18:00",
  defenseDuration: 30,
  breakDuration: 15,
  groupCreationStartDate: daysFromNow(-14),
  groupCreationEndDate: daysFromNow(14),
};
