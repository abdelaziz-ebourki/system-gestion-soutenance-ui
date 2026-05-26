import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import DefenseSchedule from "@/components/print/DefenseSchedule";

interface BackendSlot {
  date: string;
  time: string;
  roomName: string;
  projectTitle: string;
  studentNames: string[];
}

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
    api<{ defenseSessionName: string; slots: BackendSlot[] }>(
      "/coordinator/documents/schedule",
      {
        method: "POST",
        body: JSON.stringify({ defenseSessionId: sessionId }),
      },
    ).then((res) => {
      const grouped: Record<string, ScheduleDay> = {};
      for (const s of res.slots) {
        if (!grouped[s.date]) {
          grouped[s.date] = { date: s.date, slots: [] };
        }
        grouped[s.date].slots.push({
          time: s.time,
          projectTitle: s.projectTitle,
          students: s.studentNames,
          roomName: s.roomName,
          jury: "",
        });
      }
      setData({
        settings: {} as GeneralSettings,
        sessionName: res.defenseSessionName,
        days: Object.values(grouped),
      });
    }).catch((e) => setError(e.message));
  }, [sessionId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Planning des soutenances" settings={data.settings} autoPrint>
      <DefenseSchedule sessionName={data.sessionName} days={data.days} />
    </PrintLayout>
  );
}
