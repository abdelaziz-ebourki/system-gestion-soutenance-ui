import type { DbRoom } from "./schema";

export const rooms: DbRoom[] = [
  { id: "1", name: "TD-1", capacity: 30, departmentId: "1" },
  { id: "2", name: "TD-2", capacity: 30, departmentId: "1" },
  { id: "3", name: "Amphi-1", capacity: 150, departmentId: "2" },
  { id: "4", name: "TP-1", capacity: 20, departmentId: "1" },
  { id: "5", name: "TP-2", capacity: 20, departmentId: "2" },
];
