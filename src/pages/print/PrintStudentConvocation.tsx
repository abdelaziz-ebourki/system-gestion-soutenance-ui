import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { GeneralSettings } from "@/lib/api-core";
import type { StudentDefenseDetails } from "@/types";
import PrintLayout from "@/components/print/PrintLayout";
import StudentConvocation from "@/components/print/StudentConvocation";

export default function PrintStudentConvocation() {
  const [data, setData] = useState<{ settings: GeneralSettings; defense: StudentDefenseDetails; studentName: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<GeneralSettings>("/admin/config/general", { requiresAuth: false }),
      api<StudentDefenseDetails>("/student/defense", { requiresAuth: false }),
      api<{ firstName: string; lastName: string }>("/student/profile", { requiresAuth: false }).catch(() => ({ firstName: "", lastName: "" })),
    ]).then(([settings, defense, profile]) => {
      const studentName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Étudiant";
      setData({ settings, defense, studentName });
    }).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Chargement...</div>;

  return (
    <PrintLayout title="Convocation — Étudiant" settings={data.settings} autoPrint>
      <StudentConvocation defense={data.defense} studentName={data.studentName} />
    </PrintLayout>
  );
}
