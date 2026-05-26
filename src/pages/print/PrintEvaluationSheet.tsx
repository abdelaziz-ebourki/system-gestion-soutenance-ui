import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import type { ProjectGrade } from "@/lib/api-coordinator";
import PrintLayout from "@/components/print/PrintLayout";
import EvaluationSheet from "@/components/print/EvaluationSheet";

export default function PrintEvaluationSheet() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const [data, setData] = useState<{ settings: GeneralSettings; grade: ProjectGrade; studentNames: string[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) { setError("Paramètre projectId manquant"); return; }
    api<{ settings: GeneralSettings; grade: ProjectGrade; studentNames: string[] }>(
      "/coordinator/documents/evaluation-sheets",
      {
        method: "POST",
        body: JSON.stringify({ projectId }),
      },
    ).then(setData).catch((e) => setError(e.message));
  }, [projectId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;
  if (!data.grade) return <div className="p-8 text-muted-foreground">Aucune donnée de note disponible.</div>;

  return (
    <PrintLayout title="Fiche d'évaluation" settings={data.settings} autoPrint>
      <EvaluationSheet grade={data.grade} studentNames={data.studentNames} juryRoleCoefficients={data.grade.evaluationCoefficients} />
    </PrintLayout>
  );
}
