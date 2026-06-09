import { useSearchParams } from "react-router-dom";
import { useProcesVerbal, useProjectGrades } from "@/hooks/queries";
import PrintLayout from "@/components/print/PrintLayout";
import ProcesVerbal from "@/components/print/ProcesVerbal";

export default function PrintProcesVerbal() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const { data, isLoading, error } = useProcesVerbal(projectId ? Number(projectId) : null);
  const gradesQuery = useProjectGrades();

  if (error) return <div className="p-8 text-red-600" data-testid="print-pv-error">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8" data-testid="print-pv-loading">Chargement...</div>;

  const gradeForProject = (gradesQuery.data ?? []).find((g) => g.projectId === data.grade.projectId);

  return (
    <div data-testid="print-pv-root">
      <PrintLayout title="Procès-Verbal de Soutenance" settings={data.settings} autoPrint>
        <ProcesVerbal
          grade={{
            projectId: data.grade.projectId,
            projectTitle: data.grade.projectTitle,
            defenseDate: gradeForProject?.defenseDate ?? "",
            status: data.grade.decision,
            finalScore: data.grade.finalScore,
            evaluationCoefficients: gradeForProject?.evaluationCoefficients ?? {},
            individualScores: gradeForProject?.individualScores ?? data.juryMembers.map((m) => ({ roleName: m.roleName, teacherName: m.teacherName, score: 0 })),
          }}
          studentNames={data.studentNames}
          supervisorName={data.supervisorName}
          juryMembers={data.juryMembers}
        />
      </PrintLayout>
    </div>
  );
}

