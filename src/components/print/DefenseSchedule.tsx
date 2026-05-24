interface DefenseScheduleProps {
  sessionName: string;
  days: { date: string; slots: { time: string; projectTitle: string; students: string[]; roomName: string; jury: string }[] }[];
}

export default function DefenseSchedule({ sessionName, days }: DefenseScheduleProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 text-sm">
        <p><span className="font-medium">Session :</span> {sessionName}</p>
      </div>

      {days.map((day, di) => (
        <div key={di} className="break-inside-avoid">
          <h3 className="mb-2 text-base font-semibold">{day.date}</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Horaire</th>
                <th className="border p-2 text-left">Projet</th>
                <th className="border p-2 text-left">Étudiants</th>
                <th className="border p-2 text-left">Salle</th>
                <th className="border p-2 text-left">Jury</th>
              </tr>
            </thead>
            <tbody>
              {day.slots.length === 0 ? (
                <tr><td colSpan={5} className="border p-4 text-center text-muted-foreground">Aucune soutenance</td></tr>
              ) : day.slots.map((slot, si) => (
                <tr key={si}>
                  <td className="border p-2">{slot.time}</td>
                  <td className="border p-2 font-medium">{slot.projectTitle}</td>
                  <td className="border p-2">{slot.students.join(", ") || "—"}</td>
                  <td className="border p-2">{slot.roomName}</td>
                  <td className="border p-2">{slot.jury}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
