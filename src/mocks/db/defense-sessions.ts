import { daysFromNow } from ".";

export const defenseSessions = [
  {
    id: "ds1",
    globalSessionId: "1",
    name: "Soutenance Normale 2026",
    defenseType: "pfe",
    status: "active" as const,
    maxGroupSize: 3,
    defenseDuration: 30,
    breakDuration: 15,
    submissionDeadline: daysFromNow(10),
    evaluationCoefficients: { rapport: 0.4, presentation: 0.3, soutenance: 0.3 },
    juryRoleTemplateId: "jt1",
    startDate: daysFromNow(-5),
    endDate: daysFromNow(25),
  },
  {
    id: "ds2",
    globalSessionId: "1",
    name: "Soutenance Rattrapage 2026",
    defenseType: "memoire",
    status: "draft" as const,
    maxGroupSize: 2,
    defenseDuration: 20,
    breakDuration: 10,
    submissionDeadline: daysFromNow(35),
    evaluationCoefficients: { rapport: 0.5, presentation: 0.25, soutenance: 0.25 },
    juryRoleTemplateId: "jt1",
    startDate: daysFromNow(30),
    endDate: daysFromNow(45),
  },
];
