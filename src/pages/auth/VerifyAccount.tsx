import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { adjacencyGraphs } from "@zxcvbn-ts/language-common";
import { translations } from "@zxcvbn-ts/language-en";
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
import { validate, verifyAccountSchema } from "@/lib/validations";

zxcvbnOptions.setOptions({
  translations,
  graphs: adjacencyGraphs,
  useLevenshteinDistance: true,
});

const PASSWORD_LABELS = ["Tres faible", "Faible", "Moyen", "Fort", "Tres fort"];
const PASSWORD_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
];

export default function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const passwordResult = password ? zxcvbn(password) : null;

  React.useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const handleVerify = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const errors = validate(verifyAccountSchema, { password, confirmPassword });
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await api("/auth/verify-account", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      toast.success(
        "Compte activé avec succès, vous pouvez maintenant vous connecter.",
      );
      navigate("/login");
    } catch (error) {
      toastError(error, "Erreur lors de l'activation du compte. Lien peut-être expiré.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Activation de votre compte</CardTitle>
          <CardDescription>
            Définissez votre mot de passe pour activer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Field>
              <FieldLabel>Nouveau mot de passe</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={fieldErrors?.password}
              />
              {passwordResult && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= passwordResult.score
                            ? PASSWORD_COLORS[passwordResult.score]
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {PASSWORD_LABELS[passwordResult.score]}
                    </span>
                    {passwordResult.feedback.suggestions.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {passwordResult.feedback.suggestions[0]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Field>
            <Field>
              <FieldLabel>Confirmer le mot de passe</FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={fieldErrors?.confirmPassword}
              />
            </Field>
            <Button
              className="w-full"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Activation..."
            >
              Activer mon compte
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
