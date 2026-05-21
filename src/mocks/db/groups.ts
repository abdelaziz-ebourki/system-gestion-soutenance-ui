import type { DbGroup, DbGroupMember } from "./schema";

export const groups: DbGroup[] = [
  { id: "g1", projectId: "p1", sessionId: "1" },
  { id: "g2", projectId: "p2", sessionId: "1" },
  { id: "g3", projectId: "p3", sessionId: "1" },
  { id: "g4", projectId: "p4", sessionId: "1" },
  { id: "g5", projectId: "p5", sessionId: "1" },
];

export const groupMembers: DbGroupMember[] = [
  { groupId: "g1", studentId: "std-1" },
  { groupId: "g1", studentId: "std-2" },
  { groupId: "g2", studentId: "std-3" },
  { groupId: "g3", studentId: "std-4" },
  { groupId: "g3", studentId: "std-5" },
  { groupId: "g4", studentId: "std-6" },
  { groupId: "g5", studentId: "std-demo" },
];
