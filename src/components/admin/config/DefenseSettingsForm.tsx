import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import {
  useDefenseSettings, useUpdateDefenseSettings,
} from "@/hooks/use-queries";
import type { DefenseSettings } from "@/lib/api";
import { validate, defenseSettingsSchema } from "@/lib/validations";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { Field, FieldLabel } from "@/components/ui/field";

export function DefenseSettingsForm() {
  const { data: defSettings, isLoading } = useDefenseSettings();
  const updateMut = useUpdateDefenseSettings();
  const [settings, setSettings] = useState<DefenseSettings>({
    startTime: "08:00",
    endTime: "18:00",
    defenseDuration: 30,
    breakDuration: 15,
    groupCreationStartDate: "",
    groupCreationEndDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defSettings) setSettings(defSettings);
  }, [defSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(defenseSettingsSchema, settings);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateMut.mutateAsync(settings);
      toast.success("Paramètres mis à jour");
    } catch (error) {
      toastError(error, "Erreur lors de la mise à jour des paramètres");
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-5" /> Paramètres des Soutenances
        </CardTitle>
        <CardDescription>
          Définissez les créneaux horaires globaux.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Début de journée</FieldLabel>
              <Input
                type="time"
                value={settings.startTime}
                onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                required
                error={fieldErrors?.startTime}
              />
            </Field>
            <Field>
              <FieldLabel>Fin de journée</FieldLabel>
              <Input
                type="time"
                value={settings.endTime}
                onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                required
                error={fieldErrors?.endTime}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Durée soutenance (min)</FieldLabel>
              <Input
                type="number"
                value={settings.defenseDuration}
                onChange={(e) => setSettings({ ...settings, defenseDuration: parseInt(e.target.value) })}
                required
                error={fieldErrors?.defenseDuration}
              />
            </Field>
            <Field>
              <FieldLabel>Durée repos (min)</FieldLabel>
              <Input
                type="number"
                value={settings.breakDuration}
                onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) })}
                required
                error={fieldErrors?.breakDuration}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Début création groupes</FieldLabel>
              <Input
                type="date"
                value={settings.groupCreationStartDate}
                onChange={(e) => setSettings({ ...settings, groupCreationStartDate: e.target.value })}
                required
                error={fieldErrors?.groupCreationStartDate}
              />
            </Field>
            <Field>
              <FieldLabel>Fin création groupes</FieldLabel>
              <Input
                type="date"
                value={settings.groupCreationEndDate}
                onChange={(e) => setSettings({ ...settings, groupCreationEndDate: e.target.value })}
                required
                error={fieldErrors?.groupCreationEndDate}
              />
            </Field>
          </div>
          <Button type="submit" className="mt-2" isLoading={updateMut.isPending} loadingText="Sauvegarde en cours...">
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
