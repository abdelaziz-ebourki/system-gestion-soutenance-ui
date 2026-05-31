import { useSearchParams } from "react-router-dom";
import { useDefenseScheduleDoc } from "@/hooks/use-queries";
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
  const { data, isLoading, error } = useDefenseScheduleDoc(sessionId);

  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8">Chargement...</div>;

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
    <PrintLayout title="Planning des soutenances" settings={{} as GeneralSettings} autoPrint>
      <DefenseSchedule sessionName={data.defenseSessionName} days={Object.values(grouped)} />
    </PrintLayout>
  );
}
