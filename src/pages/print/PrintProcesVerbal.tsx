import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import type { ProjectGrade } from "@/lib/api-coordinator";
import PrintLayout from "@/components/print/PrintLayout";
import ProcesVerbal from "@/components/print/ProcesVerbal";

export default function PrintProcesVerbal() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const [data, setData] = useState<{ settings: GeneralSettings; grade: ProjectGrade; studentNames: string[]; supervisorName: string; juryMembers: { roleName: string; teacherName: string }[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) { setError("Paramètre projectId manquant"); return; }
    api<typeof data>("/coordinator/documents/proces-verbal", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    }).then(setData).catch((e) => setError(e.message));
  }, [projectId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;
  if (!data.grade) return <div className="p-8 text-muted-foreground">Aucune donnée disponible pour ce projet.</div>;

  return (
    <PrintLayout title="Procès-Verbal de Soutenance" settings={data.settings} autoPrint>
      <ProcesVerbal grade={data.grade} studentNames={data.studentNames} supervisorName={data.supervisorName} juryMembers={data.juryMembers} />
    </PrintLayout>
  );
}
