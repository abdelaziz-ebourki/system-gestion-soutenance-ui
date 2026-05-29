import { BookOpen, Layers } from "lucide-react";
import { useMajors, useCreateMajor, useUpdateMajor, useDeleteMajor, useLevels, useCreateLevel, useUpdateLevel, useDeleteLevel } from "@/hooks/use-queries";
import { ConfigEntityManager } from "@/components/admin/config/ConfigEntityManager";
import { EmailConfigForm } from "@/components/admin/config/EmailConfigForm";

export default function Configuration() {
  return (
    <div className="space-y-6">
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
          data={useMajors().data}
          createMut={useCreateMajor()}
          updateMut={useUpdateMajor()}
          deleteMut={useDeleteMajor()}
        />
        <ConfigEntityManager
          title="Niveaux"
          description="Cycles universitaires."
          icon={<Layers className="size-5" />}
          entityLabel="Niveau"
          entityLabelPlural="Niveaux"
          data={useLevels().data}
          createMut={useCreateLevel()}
          updateMut={useUpdateLevel()}
          deleteMut={useDeleteLevel()}
        />
        <EmailConfigForm />
      </div>
    </div>
  );
}
