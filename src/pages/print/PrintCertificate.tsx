import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import Certificate from "@/components/print/Certificate";

interface CertificateData {
  settings: GeneralSettings;
  studentName: string;
  projectTitle: string;
  defenseType: string;
  date: string;
  grade: string;
  decision: string;
}

export default function PrintCertificate() {
  const [params] = useSearchParams();
  const projectId = params.get("projectId");
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) { setError("Paramètre projectId manquant"); return; }
    api<CertificateData>(`/coordinator/document-data/certificate?projectId=${projectId}`, { requiresAuth: false })
      .then(setData).catch((e) => setError(e.message));
  }, [projectId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Attestation" settings={data.settings} autoPrint>
      <Certificate
        studentName={data.studentName}
        projectTitle={data.projectTitle}
        defenseType={data.defenseType}
        date={data.date}
        institutionName={data.settings.institutionName}
        grade={data.grade}
        decision={data.decision}
      />
    </PrintLayout>
  );
}
