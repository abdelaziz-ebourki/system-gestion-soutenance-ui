interface AttendanceListProps {
  sessionName: string;
  date: string;
  slots: { time: string; project: { title: string; students: string[] }; jury: string; supervisor: string }[];
}

export default function AttendanceList({ sessionName, date, slots }: AttendanceListProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 text-sm">
        <p><span className="font-medium">Session :</span> {sessionName}</p>
        <p><span className="font-medium">Date :</span> {date}</p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">Horaire</th>
            <th className="border p-2 text-left">Projet</th>
            <th className="border p-2 text-left">Étudiants</th>
            <th className="border p-2 text-left">Jury</th>
            <th className="border p-2 text-left">Encadrant</th>
            <th className="border p-2 text-center w-20">Présence</th>
          </tr>
        </thead>
        <tbody>
          {slots.length === 0 ? (
            <tr><td colSpan={6} className="border p-4 text-center text-muted-foreground">Aucune soutenance programmée</td></tr>
          ) : slots.map((slot, i) => (
            <tr key={i}>
              <td className="border p-2">{slot.time}</td>
              <td className="border p-2 font-medium">{slot.project.title}</td>
              <td className="border p-2">{slot.project.students.join(", ") || "—"}</td>
              <td className="border p-2">{slot.jury}</td>
              <td className="border p-2">{slot.supervisor}</td>
              <td className="border p-2 text-center"><span className="text-muted-foreground">___</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Coordonnateur</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Président du jury</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Secrétaire</div>
          <div className="border-t pt-1">Signature</div>
        </div>
      </div>
    </div>
  );
}
