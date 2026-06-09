import { useSearchParams } from "react-router-dom";
import { useDefenseScheduleDoc } from "@/hooks/queries";

import PrintLayout from "@/components/print/PrintLayout";
import DefenseSchedule from "@/components/print/DefenseSchedule";

interface ScheduleDay {
  date: string;
  slots: { time: string; projectTitle: string; students: string[]; roomName: string; jury: string }[];
}

export default function PrintDefenseSchedule() {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId");
  const { data, isLoading, error } = useDefenseScheduleDoc(sessionId ? Number(sessionId) : null);

  if (error) return <div className="p-8 text-red-600" data-testid="print-schedule-error">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8" data-testid="print-schedule-loading">Chargement...</div>;

  const grouped: Record<string, ScheduleDay> = {};
  for (const s of data.slots) {
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

  return (
    <div data-testid="print-schedule-root">
      <PrintLayout title="Planning des soutenances" autoPrint>
        <DefenseSchedule sessionName={data.defenseSessionName} days={Object.values(grouped)} />
      </PrintLayout>
    </div>
  );
}

