import type { DbUnavailability } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const unavailability: DbUnavailability[] = [
  {
    id: "ua1", teacherId: "3",
    date: daysFromNow(1),
    slots: ["10:15 - 11:45"],
  },
  {
    id: "ua2", teacherId: "3",
    date: daysFromNow(4),
    slots: ["08:30 - 10:00", "10:15 - 11:45"],
  },
];
