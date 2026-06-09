import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import {
  useEmailConfig, useUpdateEmailConfig,
} from "@/hooks/use-queries";
import type { EmailConfig } from "@/lib/api";
import { emailConfigSchema, validate } from "@/lib/validations";
import { DEFAULT_SMTP_PORT } from "@/lib/constants";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
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
  Skeleton,
} from "@/components/ui";
import { Field, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui";

const ENCRYPTION_OPTIONS = [
  { value: "tls", label: "TLS" },
  { value: "ssl", label: "SSL" },
  { value: "none", label: "Aucun" },
];

export function EmailConfigForm() {
  const { data: initial, isLoading } = useEmailConfig();
  const updateMut = useUpdateEmailConfig();
  const [config, setConfig] = useState<EmailConfig>({
    id: 0,
    host: "",
    port: DEFAULT_SMTP_PORT,
    username: "",
    password: "",
    senderName: "",
    senderEmail: "",
    encryption: "tls",
  });

  useEffect(() => {
    if (initial) setConfig(initial);
  }, [initial]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validate(emailConfigSchema, config as typeof config & { encryption: "none" | "tls" | "ssl" });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors(null);
    try {
      await updateMut.mutateAsync(config);
      toast.success("Configuration email mise à jour");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la mise à jour"));
    }
  };

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-5" /> Configuration Email
        </CardTitle>
        <CardDescription>
          Paramètres du serveur SMTP pour l'envoi des notifications par email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Hôte SMTP</FieldLabel>
              <Input
                value={config.host ?? ''}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="smtp.example.com"
                required
              />
              {fieldErrors?.host && <p className="text-sm text-destructive">{fieldErrors.host}</p>}
            </Field>
            <Field>
              <FieldLabel>Port</FieldLabel>
              <Input
                type="number"
                value={config.port ?? DEFAULT_SMTP_PORT}
                onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
                required
              />
              {fieldErrors?.port && <p className="text-sm text-destructive">{fieldErrors.port}</p>}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Nom d'utilisateur</FieldLabel>
              <Input
                value={config.username ?? ''}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="noreply@example.com"
              />
            </Field>
             <Field>
               <FieldLabel>Mot de passe</FieldLabel>
               <PasswordInput
                 value={config.password ?? ''}
                 onChange={(e) => setConfig({ ...config, password: e.target.value })}
               />
             </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Nom de l'expéditeur</FieldLabel>
              <Input
                value={config.senderName ?? ''}
                onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                placeholder="Université"
                required
              />
              {fieldErrors?.senderName && <p className="text-sm text-destructive">{fieldErrors.senderName}</p>}
            </Field>
            <Field>
              <FieldLabel>Email de l'expéditeur</FieldLabel>
              <Input
                type="email"
                value={config.senderEmail ?? ''}
                onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                placeholder="noreply@example.com"
                required
              />
              {fieldErrors?.senderEmail && <p className="text-sm text-destructive">{fieldErrors.senderEmail}</p>}
            </Field>
          </div>
            <Field>
              <FieldLabel>Chiffrement</FieldLabel>
              <Select
                value={config.encryption ?? 'tls'}
                onValueChange={(v) => setConfig({ ...config, encryption: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCRYPTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
