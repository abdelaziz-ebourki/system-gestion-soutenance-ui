import type { DbSession } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const sessions: DbSession[] = [
  {
    id: "1", name: "Session Normale 2026", type: "Normale",
    status: "active", startDate: daysFromNow(-5), endDate: daysFromNow(25),
  },
  {
    id: "2", name: "Session Rattrapage 2026", type: "Rattrapage",
    status: "draft", startDate: daysFromNow(30), endDate: daysFromNow(45),
  },
];
