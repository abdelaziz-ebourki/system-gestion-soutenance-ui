import type { DbSession } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const sessions: DbSession[] = [
  {
    id: "s1",
    name: "Session Normale 2025/2026",
    type: "normale",
    status: "active",
    startDate: daysFromNow(-90),
    endDate: daysFromNow(90),
  },
  {
    id: "s2",
    name: "Session Rattrapage 2025/2026",
    type: "rattrapage",
    status: "draft",
    startDate: daysFromNow(30),
    endDate: daysFromNow(120),
  },
];
