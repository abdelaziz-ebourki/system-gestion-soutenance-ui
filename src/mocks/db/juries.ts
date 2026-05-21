import type { DbJury } from "./schema";

export const juries: DbJury[] = [
  { id: "j1", projectId: "p1", presidentId: "3", reporterId: "4", examinerId: "2" },
  { id: "j2", projectId: "p3", presidentId: "4", reporterId: "3", examinerId: "2" },
  { id: "j3", projectId: "p5", presidentId: "4", reporterId: "3", examinerId: "2" },
];
