import type { ProjectGrade } from "@/lib/api-coordinator";

interface EvaluationSheetProps {
  grade: ProjectGrade;
  studentNames: string[];
  juryRoleCoefficients: Record<string, number>;
}

export default function EvaluationSheet({ grade, studentNames, juryRoleCoefficients }: EvaluationSheetProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-semibold">Fiche d'évaluation</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr><td className="py-1 font-medium pr-4 w-40">Projet</td><td>{grade.projectTitle}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Étudiants</td><td>{studentNames.join(", ") || "Non renseigné"}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Date</td><td>{grade.defenseDate ?? "Non planifiée"}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Note finale</td><td>{grade.finalScore !== null ? `${grade.finalScore}/20` : "—"}</td></tr>
          </tbody>
        </table>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">Rôle</th>
            <th className="border p-2 text-left">Membre du jury</th>
            <th className="border p-2 text-center">Coefficient</th>
            <th className="border p-2 text-center">Note</th>
          </tr>
        </thead>
        <tbody>
          {grade.individualScores.map((item, i) => (
            <tr key={i}>
              <td className="border p-2">{item.roleName}</td>
              <td className="border p-2">{item.teacherName}</td>
              <td className="border p-2 text-center">{juryRoleCoefficients[item.roleName] ?? "—"}%</td>
              <td className="border p-2 text-center">{item.score !== undefined ? `${item.score}/20` : "___/20"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="text-center">
          <div className="mb-1 text-xs text-muted-foreground">Président du jury</div>
          <div className="border-t pt-1 text-sm">Signature</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-xs text-muted-foreground">Rapporteur</div>
          <div className="border-t pt-1 text-sm">Signature</div>
        </div>
        <div className="text-center">
          <div className="mb-1 text-xs text-muted-foreground">Examinateur</div>
          <div className="border-t pt-1 text-sm">Signature</div>
        </div>
      </div>
    </div>
  );
}
