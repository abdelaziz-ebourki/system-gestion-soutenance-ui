import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import DefenseSchedule from "@/components/print/DefenseSchedule";

interface ScheduleDay {
  date: string;
  slots: { time: string; projectTitle: string; students: string[]; roomName: string; jury: string }[];
}

export default function PrintDefenseSchedule() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const [data, setData] = useState<{ settings: GeneralSettings; sessionName: string; days: ScheduleDay[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) { setError("Paramètre sessionId manquant"); return; }
    api<typeof data>(`/coordinator/document-data/schedule?sessionId=${sessionId}`, { requiresAuth: false })
      .then(setData).catch((e) => setError(e.message));
  }, [sessionId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Planning des soutenances" settings={data.settings} autoPrint>
      <DefenseSchedule sessionName={data.sessionName} days={data.days} />
    </PrintLayout>
  );
}
