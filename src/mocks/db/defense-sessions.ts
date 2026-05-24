import type { DbDefenseSession } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const defenseSessions: DbDefenseSession[] = [
  {
    id: "ds1",
    globalSessionId: "s1",
    name: "Soutenance PFE 2025/2026",
    defenseType: "pfe",
    status: "active",
    maxGroupSize: 3,
    defenseDuration: 30,
    breakDuration: 15,
    submissionDeadline: daysFromNow(30),
    evaluationCoefficients: {
      Président: 30,
      Rapporteur: 35,
      Examinateur: 35,
    },
    juryRoleTemplateId: "jt1",
    startDate: daysFromNow(14),
    endDate: daysFromNow(60),
  },
  {
    id: "ds2",
    globalSessionId: "s1",
    name: "Soutenance Mémoire 2025/2026",
    defenseType: "memoire",
    status: "draft",
    maxGroupSize: 2,
    defenseDuration: 20,
    breakDuration: 10,
    submissionDeadline: daysFromNow(45),
    evaluationCoefficients: {
      Président: 30,
      Rapporteur: 35,
      Examinateur: 35,
    },
    juryRoleTemplateId: "jt2",
    startDate: daysFromNow(30),
    endDate: daysFromNow(75),
  },
];
