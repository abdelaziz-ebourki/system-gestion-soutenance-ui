import type { DbDefense, DbDefenseTeacher, DbEvaluation } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const defenses: DbDefense[] = [
  {
    id: "td1", projectId: "p1", defenseType: "pfe",
    date: daysFromNow(2), startTime: "08:30", endTime: "10:00",
    roomId: "1", status: "scheduled",
  },
  {
    id: "td2", projectId: "p3", defenseType: "pfe",
    date: daysFromNow(3), startTime: "10:15", endTime: "11:45",
    roomId: "2", status: "scheduled",
  },
  {
    id: "td3", projectId: "p4", defenseType: "memoire",
    date: daysFromNow(-5), startTime: "13:45", endTime: "15:15",
    roomId: "3", status: "completed",
  },
];

export const defenseTeachers: DbDefenseTeacher[] = [
  { defenseId: "td1", teacherId: "3", role: "president" },
  { defenseId: "td2", teacherId: "4", role: "reporter" },
  { defenseId: "td3", teacherId: "3", role: "supervisor" },
];

export const evaluations: DbEvaluation[] = [
  { id: "te1", defenseId: "td1", teacherId: "3", status: "pending" },
  { id: "te2", defenseId: "td2", teacherId: "4", status: "pending" },
  {
    id: "te3", defenseId: "td3", teacherId: "3",
    score: 17, comment: "Presentation claire et demonstration solide.",
    status: "submitted", submittedAt: `${daysFromNow(-5)}T16:20:00Z`,
  },
];
