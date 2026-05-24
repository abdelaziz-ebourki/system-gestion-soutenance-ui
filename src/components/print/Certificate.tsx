interface CertificateProps {
  studentName: string;
  projectTitle: string;
  defenseType: string;
  date: string;
  institutionName: string;
  grade: string;
  decision: string;
}

export default function Certificate({
  studentName,
  projectTitle,
  defenseType,
  date,
  institutionName,
  grade,
  decision,
}: CertificateProps) {
  return (
    <div className="max-w-2xl mx-auto p-12 text-center">
      <div className="border-4 border-double border-primary p-12">
        <h1 className="text-2xl font-bold mb-2">Attestation de Soutenance</h1>
        <p className="text-muted-foreground mb-8">{institutionName}</p>

        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl text-primary font-bold">✓</span>
        </div>

        <p className="text-lg mb-2">Je soussigné,</p>
        <p className="text-lg mb-8">Le Président du jury de soutenance</p>

        <p className="text-base mb-4">
          Atteste que <span className="font-bold text-lg">{studentName}</span>
        </p>
        <p className="text-base mb-4">
          a soutenu son {defenseType} intitulé :
        </p>
        <p className="text-lg font-bold italic mb-6">"{projectTitle}"</p>
        <p className="text-base mb-4">
          en date du <span className="font-semibold">{date}</span>
        </p>

        <div className="border-t pt-6 mt-8">
          <p className="text-base mb-2">Obtenu la mention :</p>
          <p className="text-3xl font-bold text-primary mb-4">{decision}</p>
          {grade && <p className="text-lg text-muted-foreground">Note : {grade}/20</p>}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold">Le Président</p>
            <div className="h-12" />
            <p className="border-t pt-1">Signature</p>
          </div>
          <div>
            <p className="font-semibold">Le Rapporteur</p>
            <div className="h-12" />
            <p className="border-t pt-1">Signature</p>
          </div>
          <div>
            <p className="font-semibold">L'Examinateur</p>
            <div className="h-12" />
            <p className="border-t pt-1">Signature</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          Document généré automatiquement — Fait à {institutionName}
        </p>
      </div>
    </div>
  );
}
