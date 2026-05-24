import type { StudentDefenseDetails } from "@/types";

interface StudentConvocationProps {
  defense: StudentDefenseDetails;
  studentName: string;
}

export default function StudentConvocation({ defense, studentName }: StudentConvocationProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-primary p-6 text-center">
        <h2 className="mb-2 text-xl font-bold">Convocation</h2>
        <p className="text-muted-foreground">Étudiant</p>
      </div>

      <div className="space-y-3 text-sm">
        <p>L'étudiant(e) <strong>{studentName}</strong> est convoqué(e) à la soutenance suivante :</p>

        <table className="w-full">
          <tbody>
            <tr><td className="py-1.5 font-medium pr-4 w-36">Projet</td><td>{defense.projectTitle}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Encadrant</td><td>{defense.supervisorName}</td></tr>
            {defense.date && <tr><td className="py-1.5 font-medium pr-4">Date</td><td>{defense.date}</td></tr>}
            {defense.startTime && <tr><td className="py-1.5 font-medium pr-4">Horaire</td><td>{defense.startTime}{defense.endTime ? ` — ${defense.endTime}` : ""}</td></tr>}
            {defense.roomName && <tr><td className="py-1.5 font-medium pr-4">Salle</td><td>{defense.roomName}</td></tr>}
          </tbody>
        </table>
      </div>

      {defense.juryMembers.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Composition du jury</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Rôle</th>
                <th className="border p-2 text-left">Membre</th>
              </tr>
            </thead>
            <tbody>
              {defense.juryMembers.map((m, i) => (
                <tr key={i}>
                  <td className="border p-2">{m.role}</td>
                  <td className="border p-2">{m.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {defense.result && (
        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
          <p><span className="font-medium">Résultat :</span> {defense.result.decision}</p>
          {defense.result.score !== undefined && <p><span className="font-medium">Note :</span> {defense.result.score}/20</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Le coordonnateur</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">L'étudiant(e)</div>
          <div className="border-t pt-1">Signature</div>
        </div>
      </div>
    </div>
  );
}
