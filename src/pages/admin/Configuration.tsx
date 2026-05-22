import { MajorManager } from "@/components/admin/config/MajorManager";
import { LevelManager } from "@/components/admin/config/LevelManager";
import { GradeManager } from "@/components/admin/config/GradeManager";
import { DefenseSettingsForm } from "@/components/admin/config/DefenseSettingsForm";
import { JuryRoleTemplateManager } from "@/components/admin/config/JuryRoleTemplateManager";

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
        <MajorManager />
        <LevelManager />
        <GradeManager />
        <JuryRoleTemplateManager />
        <DefenseSettingsForm />
      </div>
    </div>
  );
}
