import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Globe, GraduationCap, CheckCircle } from "lucide-react";
import { useGeneralSettings, useUpdateGeneralSettings, useDefenseTypeConfig, useUpdateDefenseTypeConfig } from "@/hooks/use-queries";
import type { GeneralSettings, DefenseTypeConfig } from "@/lib/api";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

const STEPS = [
  { id: "institution", label: "Établissement", icon: Building2 },
  { id: "locale", label: "Préférences", icon: Globe },
  { id: "types", label: "Types de soutenance", icon: GraduationCap },
  { id: "done", label: "Terminé", icon: CheckCircle },
];

const TIMEZONES = [
  "Africa/Algiers", "Africa/Casablanca", "Africa/Tunis",
  "Africa/Cairo", "Europe/Paris", "Europe/London",
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { data: initialSettings } = useGeneralSettings();
  const { data: initialTypes } = useDefenseTypeConfig();
  const updateSettings = useUpdateGeneralSettings();
  const updateTypes = useUpdateDefenseTypeConfig();

  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<GeneralSettings>({
    institutionName: "",
    institutionLogoUrl: "",
    timezone: "Africa/Algiers",
    dateFormat: "DD/MM/YYYY",
    setupCompleted: false,
  });
  const [typeConfig, setTypeConfig] = useState<DefenseTypeConfig>({
    pfe: { enabled: true, label: "Projet de Fin d'Études", labelPlural: "PFEs", defaultDuration: 30, defaultBreak: 15 },
    memoire: { enabled: true, label: "Mémoire", labelPlural: "Mémoires", defaultDuration: 20, defaultBreak: 10 },
    these: { enabled: true, label: "Thèse", labelPlural: "Thèses", defaultDuration: 45, defaultBreak: 15 },
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialTypes) setTypeConfig(initialTypes);
  }, [initialTypes]);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({ ...settings, setupCompleted: true });
      await updateTypes.mutateAsync(typeConfig);
      toast.success("Configuration terminée !");
      navigate("/admin");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                    i === step ? "bg-primary text-primary-foreground" :
                    i < step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className="h-px w-8 bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Bienvenue dans l'application</h1>
                <p className="text-muted-foreground mt-1">
                  Configurons votre établissement en quelques étapes.
                </p>
              </div>
              <Field>
                <FieldLabel>Nom de l'établissement</FieldLabel>
                <Input
                  value={settings.institutionName}
                  onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                  placeholder="Université de ..."
                  required
                />
              </Field>
              <Field>
                <FieldLabel>URL du logo (optionnel)</FieldLabel>
                <Input
                  value={settings.institutionLogoUrl}
                  onChange={(e) => setSettings({ ...settings, institutionLogoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Préférences régionales</h1>
                <p className="text-muted-foreground mt-1">
                  Définissez le fuseau horaire et le format de date.
                </p>
              </div>
              <Field>
                <FieldLabel>Fuseau horaire</FieldLabel>
                <Select
                  value={settings.timezone}
                  onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Types de soutenance</h1>
                <p className="text-muted-foreground mt-1">
                  Activez les types de soutenance que vous souhaitez utiliser.
                </p>
              </div>
              {(["pfe", "memoire", "these"] as const).map((key) => {
                const tc = typeConfig[key];
                return (
                  <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium capitalize">{key === "pfe" ? "PFE" : key === "memoire" ? "Mémoire" : "Thèse"}</p>
                      <p className="text-sm text-muted-foreground">{tc.label}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={tc.enabled}
                        onChange={() => setTypeConfig({
                          ...typeConfig,
                          [key]: { ...tc, enabled: !tc.enabled },
                        })}
                      />
                      <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="mx-auto size-16 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Configuration terminée</h1>
                <p className="text-muted-foreground mt-1">
                  Vous pouvez maintenant commencer à utiliser l'application.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-left text-sm space-y-2">
                <p><span className="font-medium">Établissement :</span> {settings.institutionName}</p>
                <p><span className="font-medium">Fuseau horaire :</span> {settings.timezone}</p>
                <p><span className="font-medium">Types actifs :</span> {[
                  typeConfig.pfe.enabled && "PFE",
                  typeConfig.memoire.enabled && "Mémoire",
                  typeConfig.these.enabled && "Thèse",
                ].filter(Boolean).join(", ")}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
            >
              Précédent
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Suivant
              </Button>
            ) : (
              <Button onClick={handleFinish} isLoading={saving} loadingText="Finalisation...">
                Terminer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
