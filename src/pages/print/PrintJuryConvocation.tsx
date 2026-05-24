import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import JuryConvocation from "@/components/print/JuryConvocation";

export default function PrintJuryConvocation() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const teacherId = params.get("teacherId");
  const [data, setData] = useState<{ settings: GeneralSettings; projectTitle: string; studentNames: string[]; date: string; startTime: string; endTime: string; roomName: string; role: string; juryPresident: string; teacherName: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId || !teacherId) { setError("Paramètres projectId et teacherId requis"); return; }
    api<typeof data>(`/coordinator/document-data/jury-convocation?projectId=${projectId}&teacherId=${teacherId}`, { requiresAuth: false })
      .then(setData).catch((e) => setError(e.message));
  }, [projectId, teacherId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Convocation — Membre du jury" settings={data.settings} autoPrint>
      <JuryConvocation
        projectTitle={data.projectTitle}
        studentNames={data.studentNames}
        date={data.date}
        startTime={data.startTime}
        endTime={data.endTime}
        roomName={data.roomName}
        role={data.role}
        juryPresident={data.juryPresident}
      />
    </PrintLayout>
  );
}
