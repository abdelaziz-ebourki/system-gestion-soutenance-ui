import type { DbDepartment } from "./schema";

export const departments: DbDepartment[] = [
  { id: "d1", name: "Informatique", code: "INFO", facultyId: "f1" },
  { id: "d2", name: "Mathématiques", code: "MATH", facultyId: "f1" },
  { id: "d3", name: "Physique", code: "PHYS", facultyId: "f1" },
  { id: "d4", name: "Chimie", code: "CHIM", facultyId: "f1" },
  { id: "d5", name: "Biologie", code: "BIO", facultyId: "f1" },
  { id: "d6", name: "Génie Civil", code: "GC", facultyId: "f1" },
  { id: "d7", name: "Génie Mécanique", code: "GM", facultyId: "f1" },
  { id: "d8", name: "Électronique", code: "ELEC", facultyId: "f1" },
  { id: "d9", name: "Sciences de Gestion", code: "GEST", facultyId: "f1" },
  { id: "d10", name: "Droit", code: "DROIT", facultyId: "f1" },
];
