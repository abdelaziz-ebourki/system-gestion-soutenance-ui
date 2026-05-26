import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import AttendanceList from "@/components/print/AttendanceList";

interface AttendanceSlot {
  time: string;
  project: { title: string; students: string[] };
  jury: string;
  supervisor: string;
}

interface BackendSlot {
  date: string;
  time: string;
  roomName: string;
  projectTitle: string;
  studentNames: string[];
}

export default function PrintAttendanceList() {
  const [params] = useSearchParams();
  const date = params.get("date");
  const sessionId = params.get("sessionId");
  const [data, setData] = useState<{ settings: GeneralSettings; sessionName: string; date: string; slots: AttendanceSlot[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) { setError("Paramètre date manquant"); return; }
    if (!sessionId) { setError("Paramètre sessionId manquant"); return; }

    api<{ defenseSessionName: string; slots: BackendSlot[] }>(
      "/coordinator/documents/attendance-lists",
      {
        method: "POST",
        body: JSON.stringify({ defenseSessionId: sessionId }),
      },
    ).then((res) => {
      const filtered = res.slots.filter((s) => s.date === date);
      const slots: AttendanceSlot[] = filtered.map((s) => ({
        time: s.time,
        project: { title: s.projectTitle, students: s.studentNames },
        jury: "",
        supervisor: "",
      }));
      setData({
        settings: {} as GeneralSettings,
        sessionName: res.defenseSessionName,
        date,
        slots,
      });
    }).catch((e) => setError(e.message));
  }, [date, sessionId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Liste de présence" settings={data.settings} autoPrint>
      <AttendanceList sessionName={data.sessionName} date={data.date} slots={data.slots} />
    </PrintLayout>
  );
}
