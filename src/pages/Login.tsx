import { siteConfig } from "@/config/site";
import { useState, type FormEvent } from "react";
import { Landmark, ShieldCheck, BookOpen } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  PasswordInput,
} from "@/components/ui";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "@/lib/api-auth";
import { useAuth } from "@/contexts/auth-context";
import { validate, loginSchema } from "@/lib/validations";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(loginSchema, { email, password });
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await loginApi({ email, password });

      toast.success(`Bienvenue, ${data.user.firstName} ${data.user.lastName}`);

      login(data.user);

      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        coordinator: "/coordinator",
        teacher: "/teacher",
        student: "/student",
      };

      navigate(roleRoutes[data.user.role] || "/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur de connexion"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center z-10">
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <img src="/logo.svg" alt="Logo" className="h-16 w-16" />
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
                {siteConfig.name}
              </h1>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                {siteConfig.subtitle}
              </p>
            </div>
          </div>

          <h2 className="font-heading text-5xl font-medium leading-[1.1] text-foreground">
            L'excellence académique <br />
            <span className="italic text-primary">au bout des doigts.</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-md">
            Une plateforme moderne pour la gestion, la planification et le suivi
            des soutenances universitaires.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-r pr-4">
              <Landmark className="size-4" />
              <span>Officiel</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-r pr-4">
              <ShieldCheck className="size-4" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="size-4" />
              <span>Intuitif</span>
            </div>
          </div>
        </div>

        <Card className="shadow">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl">Connexion</CardTitle>
            <CardDescription>
              Veuillez entrer vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} data-testid="login-form">
            <CardContent className="grid gap-4">
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium tracking-wider">
                    Identifiants
                  </span>
                </div>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel>Email académique</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom.prenom@univh2c.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    error={fieldErrors?.email}
                    data-testid="login-email-input"
                  />
                </Field>
                <Field>
                  <FieldLabel>Mot de passe</FieldLabel>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    error={fieldErrors?.password}
                    data-testid="login-password-input"
                  />
                </Field>
              </FieldGroup>
              <div className="text-right text-sm">
                <Link
                  to="/forgot-password"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="mt-6">
              <Button
                type="submit"
                className="w-full"
                variant="default"
                isLoading={isLoading}
                loadingText="Connexion en cours..."
                data-testid="login-submit-button"
              >
                Se connecter
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="md:absolute pt-10 bottom-8 text-sm text-muted-foreground flex gap-6">
        <span>© 2026 Copyright</span>
        <span className="hover:text-primary cursor-pointer transition-colors">
          Assistance
        </span>
        <span className="hover:text-primary cursor-pointer transition-colors">
          Mentions Légales
        </span>
      </footer>
    </div>
  );
}
