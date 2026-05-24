import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import {
  useDefenseTypeConfig, useUpdateDefenseTypeConfig,
} from "@/hooks/use-queries";
import type { DefenseTypeConfig, DefenseTypeItem } from "@/lib/api";
import { validate, defenseTypeConfigSchema } from "@/lib/validations";
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
  Checkbox,
} from "@/components/ui";
import { Field, FieldLabel } from "@/components/ui/field";

type TypeKey = keyof DefenseTypeConfig;

const TYPE_META: { key: TypeKey; short: string; color: string }[] = [
  { key: "pfe", short: "PFE", color: "border-l-blue-500" },
  { key: "memoire", short: "Mémoire", color: "border-l-emerald-500" },
  { key: "these", short: "Thèse", color: "border-l-purple-500" },
];

const DEFAULTS: DefenseTypeConfig = {
  pfe: { enabled: true, label: "Projet de Fin d'Études", labelPlural: "PFEs", defaultDuration: 30, defaultBreak: 15 },
  memoire: { enabled: true, label: "Mémoire", labelPlural: "Mémoires", defaultDuration: 20, defaultBreak: 10 },
  these: { enabled: true, label: "Thèse", labelPlural: "Thèses", defaultDuration: 45, defaultBreak: 15 },
};

export function DefenseTypeConfigForm() {
  const { data: initial, isLoading } = useDefenseTypeConfig();
  const updateMut = useUpdateDefenseTypeConfig();
  const [config, setConfig] = useState<DefenseTypeConfig>(DEFAULTS);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) setConfig(initial);
  }, [initial]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validate(defenseTypeConfigSchema, config);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateMut.mutateAsync(config);
      toast.success("Configuration des types mise à jour");
    } catch (error) {
      toastError(error, "Erreur lors de la mise à jour");
    }
  };

  const updateItem = (key: TypeKey, patch: Partial<DefenseTypeItem>) => {
    setConfig({ ...config, [key]: { ...config[key], ...patch } });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-5" /> Types de Soutenance
        </CardTitle>
        <CardDescription>
          Activez, désactivez et configurez les types de soutenance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          {TYPE_META.map(({ key, short, color }) => {
            const item = config[key];
            return (
              <div key={key} className={`border-l-4 ${color} pl-4 space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{short}</span>
                  <Checkbox
                    checked={item.enabled}
                    onCheckedChange={(v) => updateItem(key, { enabled: v === true })}
                  />
                </div>
                {item.enabled && (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Libellé</FieldLabel>
                        <Input
                          value={item.label}
                          onChange={(e) => updateItem(key, { label: e.target.value })}
                          required
                          error={fieldErrors[`${key}.label`]}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Libellé (pluriel)</FieldLabel>
                        <Input
                          value={item.labelPlural}
                          onChange={(e) => updateItem(key, { labelPlural: e.target.value })}
                          required
                          error={fieldErrors[`${key}.labelPlural`]}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Durée (min)</FieldLabel>
                        <Input
                          type="number"
                          value={item.defaultDuration}
                          onChange={(e) => updateItem(key, { defaultDuration: parseInt(e.target.value) || 0 })}
                          required
                          error={fieldErrors[`${key}.defaultDuration`]}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Pause (min)</FieldLabel>
                        <Input
                          type="number"
                          value={item.defaultBreak}
                          onChange={(e) => updateItem(key, { defaultBreak: parseInt(e.target.value) || 0 })}
                          required
                          error={fieldErrors[`${key}.defaultBreak`]}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Button type="submit" className="mt-2" isLoading={updateMut.isPending} loadingText="Sauvegarde en cours...">
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
