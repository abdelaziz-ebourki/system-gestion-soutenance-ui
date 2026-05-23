import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import {
  useGeneralSettings, useUpdateGeneralSettings,
} from "@/hooks/use-queries";
import type { GeneralSettings } from "@/lib/api";
import { validate, generalSettingsSchema } from "@/lib/validations";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Field, FieldLabel } from "@/components/ui/field";

const TIMEZONES = [
  "Africa/Algiers",
  "Africa/Casablanca",
  "Africa/Tunis",
  "Africa/Cairo",
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "Asia/Dubai",
];

const DATE_FORMATS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD.MM.YYYY", label: "DD.MM.YYYY" },
];

export function GeneralSettingsForm() {
  const { data: initial, isLoading } = useGeneralSettings();
  const updateMut = useUpdateGeneralSettings();
  const [settings, setSettings] = useState<GeneralSettings>({
    institutionName: "",
    institutionLogoUrl: "",
    timezone: "Africa/Algiers",
    dateFormat: "DD/MM/YYYY",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) setSettings(initial);
  }, [initial]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validate(generalSettingsSchema, settings);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateMut.mutateAsync(settings);
      toast.success("Paramètres généraux mis à jour");
    } catch (error) {
      toastError(error, "Erreur lors de la mise à jour");
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-5" /> Paramètres Généraux
        </CardTitle>
        <CardDescription>
          Configurez l'établissement et les préférences système.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field>
            <FieldLabel>Nom de l'établissement</FieldLabel>
            <Input
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
              required
              error={fieldErrors?.institutionName}
            />
          </Field>
          <Field>
            <FieldLabel>URL du logo</FieldLabel>
            <Input
              value={settings.institutionLogoUrl}
              onChange={(e) => setSettings({ ...settings, institutionLogoUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel>Fuseau horaire</FieldLabel>
            <Select
              value={settings.timezone}
              onValueChange={(v) => setSettings({ ...settings, timezone: v })}
            >
              <SelectTrigger error={fieldErrors?.timezone}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Format de date</FieldLabel>
            <Select
              value={settings.dateFormat}
              onValueChange={(v) => setSettings({ ...settings, dateFormat: v })}
            >
              <SelectTrigger error={fieldErrors?.dateFormat}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((df) => (
                  <SelectItem key={df.value} value={df.value}>{df.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" className="mt-2" isLoading={updateMut.isPending} loadingText="Sauvegarde en cours...">
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
