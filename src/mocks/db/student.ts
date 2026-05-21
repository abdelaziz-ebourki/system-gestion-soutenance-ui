import type { DbStudentGroup, DbStudentDocument } from "./schema";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const studentGroups: DbStudentGroup[] = [
  { id: "sg1", groupName: "Groupe-1", memberIds: ["std-1", "std-2"], projectId: "p5" },
  { id: "sg2", groupName: "Groupe-2", memberIds: ["std-3"], projectId: "p2" },
];

export const studentDocuments: DbStudentDocument[] = [
  {
    id: "sd1", name: "Rapport final.pdf", type: "Rapport",
    deadline: daysFromNow(-2), status: "validated", submittedAt: daysFromNow(-4),
  },
  {
    id: "sd2", name: "Presentation finale.pptx", type: "Presentation",
    deadline: daysFromNow(5), status: "submitted", submittedAt: daysFromNow(3),
  },
  {
    id: "sd3", name: "Code source.zip", type: "Archive",
    deadline: daysFromNow(5), status: "missing",
  },
];
