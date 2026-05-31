import { useSearchParams } from "react-router-dom";
import { useJuryConvocations } from "@/hooks/use-queries";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import JuryConvocation from "@/components/print/JuryConvocation";

export default function PrintJuryConvocation() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const teacherId = params.get("teacherId");
  const { data: convocations, isLoading, error } = useJuryConvocations(projectId);

  if (!projectId || !teacherId) {
    return <div className="p-8 text-red-600">Paramètres projectId et teacherId requis</div>;
  }

  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;
  if (isLoading || !convocations) return <div className="p-8">Chargement...</div>;

  const conv = convocations.find((c) => c.teacherName.includes(teacherId));
  if (!conv) return <div className="p-8 text-red-600">Convocation introuvable pour ce professeur.</div>;

  return (
    <PrintLayout title="Convocation — Membre du jury" settings={{} as GeneralSettings} autoPrint>
      <JuryConvocation
        projectTitle={conv.projectTitle}
        studentNames={conv.studentNames}
        date={conv.date}
        startTime={conv.time}
        endTime=""
        roomName={conv.roomName}
        role={conv.role}
        juryPresident=""
      />
    </PrintLayout>
  );
}
