import { useSearchParams } from "react-router-dom";
import { useEvaluationSheet, useProjectGrades } from "@/hooks/queries";
import type { EvaluationSheetResponse } from "@/lib/api-coordinator";
import PrintLayout from "@/components/print/PrintLayout";
import EvaluationSheet from "@/components/print/EvaluationSheet";

export default function PrintEvaluationSheet() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const { data, isLoading, error } = useEvaluationSheet(projectId ? Number(projectId) : null);
  const gradesQuery = useProjectGrades();

  if (error) return <div className="p-8 text-red-600" data-testid="print-evaluation-error">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8" data-testid="print-evaluation-loading">Chargement...</div>;
  const sheets = Array.isArray(data) ? data : [data];
  const sheet: EvaluationSheetResponse | undefined = sheets[0];
  if (!sheet) return <div className="p-8 text-muted-foreground" data-testid="print-evaluation-empty">Aucune donnée de note disponible.</div>;

  const gradeForProject = (gradesQuery.data ?? []).find((g) => g.projectId === sheet.projectId);

  return (
    <div data-testid="print-evaluation-root">
      <PrintLayout title="Fiche d'évaluation" autoPrint>
        <EvaluationSheet
          grade={{
            projectId: sheet.projectId,
            projectTitle: sheet.projectTitle,
            defenseDate: sheet.date,
            status: gradeForProject?.status ?? "",
            finalScore: gradeForProject?.finalScore ?? 0,
            evaluationCoefficients: gradeForProject?.evaluationCoefficients ?? sheet.evaluationCoefficients,
            individualScores: gradeForProject?.individualScores ?? sheet.juryMembers.map((m) => ({ roleName: m.roleName, teacherName: m.teacherName, score: 0 })),
          }}
          studentNames={sheet.studentNames}
          juryRoleCoefficients={gradeForProject?.evaluationCoefficients ?? sheet.evaluationCoefficients}
        />
      </PrintLayout>
    </div>
  );
}

