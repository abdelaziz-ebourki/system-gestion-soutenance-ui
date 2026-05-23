import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import {
  useDocumentConfig, useUpdateDocumentConfig,
} from "@/hooks/use-queries";
import type { DocumentConfig } from "@/lib/api";
import { validate, documentConfigSchema } from "@/lib/validations";
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

export function DocumentConfigForm() {
  const { data: initial, isLoading } = useDocumentConfig();
  const updateMut = useUpdateDocumentConfig();
  const [config, setConfig] = useState<DocumentConfig>({
    maxFileSizeMb: 50,
    allowedExtensions: "pdf,docx,pptx,xlsx,zip",
    versionLimit: 5,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) setConfig(initial);
  }, [initial]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validate(documentConfigSchema, config);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateMut.mutateAsync(config);
      toast.success("Configuration des documents mise à jour");
    } catch (error) {
      toastError(error, "Erreur lors de la mise à jour");
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" /> Documents
        </CardTitle>
        <CardDescription>
          Configuration des documents déposés par les étudiants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field>
            <FieldLabel>Taille max (Mo)</FieldLabel>
            <Input
              type="number"
              value={config.maxFileSizeMb}
              onChange={(e) => setConfig({ ...config, maxFileSizeMb: parseInt(e.target.value) || 0 })}
              required
              error={fieldErrors?.maxFileSizeMb}
            />
          </Field>
          <Field>
            <FieldLabel>Extensions autorisées</FieldLabel>
            <Input
              value={config.allowedExtensions}
              onChange={(e) => setConfig({ ...config, allowedExtensions: e.target.value })}
              placeholder="pdf,docx,pptx"
              required
              error={fieldErrors?.allowedExtensions}
            />
          </Field>
          <Field>
            <FieldLabel>Limite de versions</FieldLabel>
            <Input
              type="number"
              value={config.versionLimit}
              onChange={(e) => setConfig({ ...config, versionLimit: parseInt(e.target.value) || 0 })}
              required
              error={fieldErrors?.versionLimit}
            />
          </Field>
          <Button type="submit" className="mt-2" isLoading={updateMut.isPending} loadingText="Sauvegarde en cours...">
            Sauvegarder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
