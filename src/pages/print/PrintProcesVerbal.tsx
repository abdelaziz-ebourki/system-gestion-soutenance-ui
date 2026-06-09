import { useSearchParams } from "react-router-dom";
import { useProcesVerbal } from "@/hooks/use-queries";
import PrintLayout from "@/components/print/PrintLayout";
import ProcesVerbal from "@/components/print/ProcesVerbal";

export default function PrintProcesVerbal() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const { data, isLoading, error } = useProcesVerbal(projectId ? Number(projectId) : null);

  if (error) return <div className="p-8 text-red-600" data-testid="print-pv-error">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8" data-testid="print-pv-loading">Chargement...</div>;

  return (
    <div data-testid="print-pv-root">
      <PrintLayout title="Procès-Verbal de Soutenance" settings={data.settings} autoPrint>
        <ProcesVerbal
          grade={{
            projectId: data.grade.projectId,
            projectTitle: data.grade.projectTitle,
            defenseDate: "",
            status: data.grade.decision,
            finalScore: data.grade.finalScore,
            evaluationCoefficients: {},
            individualScores: data.juryMembers.map((m) => ({ roleName: m.roleName, teacherName: m.teacherName, score: 0 })),
          }}
          studentNames={data.studentNames}
          supervisorName={data.supervisorName}
          juryMembers={data.juryMembers}
        />
      </PrintLayout>
    </div>
  );
}
