import type { ProjectGrade } from "@/lib/api-coordinator";

interface ProcesVerbalProps {
  grade: ProjectGrade;
  studentNames: string[];
  supervisorName: string;
  juryMembers: { roleName: string; teacherName: string }[];
}

export default function ProcesVerbal({ grade, studentNames, supervisorName, juryMembers }: ProcesVerbalProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-primary p-6 text-center">
        <h2 className="mb-1 text-xl font-bold">Procès-Verbal de Soutenance</h2>
        <p className="text-sm text-muted-foreground">PV — {grade.defenseDate ?? "Date non définie"}</p>
      </div>

      <div className="rounded-lg border p-4 text-sm">
        <table className="w-full">
          <tbody>
            <tr><td className="py-1 font-medium pr-4 w-40">Projet</td><td>{grade.projectTitle}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Étudiants</td><td>{studentNames.join(", ") || "Non renseigné"}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Encadrant</td><td>{supervisorName}</td></tr>
            <tr><td className="py-1 font-medium pr-4">Date</td><td>{grade.defenseDate ?? "Non planifiée"}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Membres du jury</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Rôle</th>
              <th className="border p-2 text-left">Nom</th>
              <th className="border p-2 text-center">Note attribuée</th>
              <th className="border p-2 text-left">Signature</th>
            </tr>
          </thead>
          <tbody>
            {juryMembers.map((m, i) => {
              const score = grade.individualScores.find((s) => s.roleName === m.roleName);
              return (
                <tr key={i}>
                  <td className="border p-2 font-medium">{m.roleName}</td>
                  <td className="border p-2">{m.teacherName}</td>
                  <td className="border p-2 text-center">{score?.score !== undefined ? `${score.score}/20` : "___/20"}</td>
                  <td className="border p-2 text-center"><span className="text-muted-foreground">____________</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {grade.finalScore !== null && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Note finale pondérée</span>
            <span className="text-lg font-bold">{grade.finalScore}/20</span>
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">Décision : </span>
            <span className={grade.finalScore >= 10 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {grade.finalScore >= 10 ? "Admis" : "Ajourné"}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Président du jury</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Rapporteur</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Examinateur</div>
          <div className="border-t pt-1">Signature</div>
        </div>
      </div>
    </div>
  );
}
