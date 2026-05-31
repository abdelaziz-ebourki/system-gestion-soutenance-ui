import { useSearchParams } from "react-router-dom";
import { useEvaluationSheet } from "@/hooks/use-queries";
import PrintLayout from "@/components/print/PrintLayout";
import EvaluationSheet from "@/components/print/EvaluationSheet";

export default function PrintEvaluationSheet() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const { data, isLoading, error } = useEvaluationSheet(projectId);

  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8">Chargement...</div>;
  if (!data.grade) return <div className="p-8 text-muted-foreground">Aucune donnée de note disponible.</div>;

  return (
    <PrintLayout title="Fiche d'évaluation" settings={data.settings} autoPrint>
      <EvaluationSheet grade={data.grade} studentNames={data.studentNames} juryRoleCoefficients={data.grade.evaluationCoefficients} />
    </PrintLayout>
  );
}
