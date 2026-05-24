interface JuryConvocationProps {
  projectTitle: string;
  studentNames: string[];
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  role: string;
  juryPresident: string;
}

export default function JuryConvocation({ projectTitle, studentNames, date, startTime, endTime, roomName, role, juryPresident }: JuryConvocationProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-primary p-6 text-center">
        <h2 className="mb-2 text-xl font-bold">Convocation</h2>
        <p className="text-muted-foreground">Membre du jury</p>
      </div>

      <div className="space-y-3 text-sm">
        <p>Vous êtes convoqué(e) en qualité de <strong>{role}</strong> pour participer à la soutenance suivante :</p>

        <table className="w-full">
          <tbody>
            <tr><td className="py-1.5 font-medium pr-4 w-36">Projet</td><td>{projectTitle}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Étudiants</td><td>{studentNames.join(", ") || "Non renseigné"}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Date</td><td>{date}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Horaire</td><td>{startTime} — {endTime}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Salle</td><td>{roomName}</td></tr>
            <tr><td className="py-1.5 font-medium pr-4">Président du jury</td><td>{juryPresident}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Le coordonnateur</div>
          <div className="border-t pt-1">Signature</div>
        </div>
        <div className="text-center text-sm">
          <div className="mb-1 text-xs text-muted-foreground">Le convoqué(e)</div>
          <div className="border-t pt-1">Signature</div>
        </div>
      </div>
    </div>
  );
}
