import { useSearchParams } from "react-router-dom";
import { useAttendanceList } from "@/hooks/queries";
import type { GeneralSettings } from "@/lib/api-core";
import PrintLayout from "@/components/print/PrintLayout";
import AttendanceList from "@/components/print/AttendanceList";

interface AttendanceSlot {
  time: string;
  project: { title: string; students: string[] };
  jury: string;
  supervisor: string;
}

export default function PrintAttendanceList() {
  const [params] = useSearchParams();
  const date = params.get("date");
  const sessionId = params.get("sessionId");
  const { data, isLoading, error } = useAttendanceList(sessionId);

  if (!date || !sessionId) {
    return <div className="p-8 text-red-600" data-testid="print-attendance-missing-params">Paramètres date et sessionId requis</div>;
  }

  if (error) return <div className="p-8 text-red-600" data-testid="print-attendance-error">{(error as Error).message}</div>;
  if (isLoading || !data) return <div className="p-8" data-testid="print-attendance-loading">Chargement...</div>;

  const filtered = data.slots.filter((s) => s.date === date);
  const slots: AttendanceSlot[] = filtered.map((s) => ({
    time: s.time,
    project: { title: s.projectTitle, students: s.studentNames },
    jury: "",
    supervisor: "",
  }));

  return (
    <div data-testid="print-attendance-root">
      <PrintLayout title="Liste de présence" settings={{} as GeneralSettings} autoPrint>
        <AttendanceList sessionName={data.defenseSessionName} date={date} slots={slots} />
      </PrintLayout>
    </div>
  );
}

