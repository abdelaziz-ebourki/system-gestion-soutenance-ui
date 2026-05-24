import type { DbRoom } from "./schema";

export const rooms: DbRoom[] = [
  { id: "r1", name: "Amphi A", capacity: 200, departmentId: "d1" },
  { id: "r2", name: "Amphi B", capacity: 150, departmentId: "d2" },
  { id: "r3", name: "Salle 101", capacity: 40, departmentId: "d1" },
  { id: "r4", name: "Salle 102", capacity: 35, departmentId: "d1" },
  { id: "r5", name: "Salle 201", capacity: 30, departmentId: "d3" },
  { id: "r6", name: "Salle 202", capacity: 30, departmentId: "d4" },
  { id: "r7", name: "Labo Info 1", capacity: 25, departmentId: "d1" },
  { id: "r8", name: "Labo Physique", capacity: 20, departmentId: "d3" },
  { id: "r9", name: "Salle de Conférence", capacity: 100, departmentId: "d6" },
  { id: "r10", name: "Amphi C", capacity: 250, departmentId: "d9" },
];
