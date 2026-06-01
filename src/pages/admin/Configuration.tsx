import { BookOpen, Layers } from "lucide-react";
import { useMajors, useCreateMajor, useUpdateMajor, useDeleteMajor, useLevels, useCreateLevel, useUpdateLevel, useDeleteLevel } from "@/hooks/use-queries";
import { ConfigEntityManager } from "@/components/admin/config/ConfigEntityManager";
import { EmailConfigForm } from "@/components/admin/config/EmailConfigForm";

export default function Configuration() {
  const majors = useMajors();
  const createMajor = useCreateMajor();
  const updateMajor = useUpdateMajor();
  const deleteMajor = useDeleteMajor();
  const levels = useLevels();
  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();

  return (
    <div className="space-y-6" data-testid="admin-configuration-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Gérez les entités fondamentales du système.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ConfigEntityManager
          title="Filières"
          description="Liste des majors disponibles."
          icon={<BookOpen className="size-5" />}
          entityLabel="Filière"
          entityLabelPlural="Filières"
          data={majors.data}
          createMut={createMajor}
          updateMut={updateMajor}
          deleteMut={deleteMajor}
        />
        <ConfigEntityManager
          title="Niveaux"
          description="Cycles universitaires."
          icon={<Layers className="size-5" />}
          entityLabel="Niveau"
          entityLabelPlural="Niveaux"
          data={levels.data}
          createMut={createLevel}
          updateMut={updateLevel}
          deleteMut={deleteLevel}
        />
        <EmailConfigForm />
      </div>
    </div>
  );
}
