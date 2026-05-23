import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
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
import { api } from "@/lib/api";
import { validate, forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(forgotPasswordSchema, { email });
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success("Si cet email existe, un lien de réinitialisation a été envoyé.");
    } catch (error) {
      toastError(error, "Erreur lors de l'envoi du lien.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Email envoyé</CardTitle>
            <CardDescription>
              Si un compte existe avec cette adresse, vous recevrez un lien de
              réinitialisation par email. Vérifiez votre boîte de réception.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" asChild>
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Saisissez votre adresse email pour recevoir un lien de
            réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Email académique</FieldLabel>
              <Input
                type="email"
                placeholder="nom.prenom@univ.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={fieldErrors?.email}
              />
            </Field>
            <Button
              className="w-full"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Envoi en cours..."
            >
              Envoyer le lien
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
