import { siteConfig } from "@/config/site";
import React from "react";
import { Landmark, ShieldCheck, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Erreur de connexion");
			}

			toast.success(`Bienvenue, ${data.user.name}`);

			// Store token and user info (simplified for now)
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));
			localStorage.setItem("expiresAt", data.expiresAt.toString());

			// Navigate based on role

			const roleRoutes: Record<string, string> = {
				admin: "/admin",
				coordinator: "/coordinator",
				teacher: "/teacher",
				student: "/student",
			};

			navigate(roleRoutes[data.user.role] || "/login");
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Erreur de connexion";
			toast.error(message);
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
							<p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">
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
							<Landmark className="h-4 w-4" />
							<span>Officiel</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground border-r pr-4">
							<ShieldCheck className="h-4 w-4" />
							<span>Sécurisé</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<BookOpen className="h-4 w-4" />
							<span>Intuitif</span>
						</div>
					</div>
				</div>

				<Card className="shadow-2xl bg-card">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-3xl font-heading font-bold">
							Connexion
						</CardTitle>
						<CardDescription>
							Veuillez entrer vos identifiants pour accéder à votre espace
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleLogin}>
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
										placeholder="nom.prenom@univ.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										disabled={isLoading}
									/>
								</Field>
								<Field>
									<FieldLabel>Mot de passe</FieldLabel>
									<PasswordInput
										id="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										disabled={isLoading}
									/>
								</Field>
							</FieldGroup>
						</CardContent>
						<CardFooter className="mt-6">
							<Button
								type="submit"
								className="w-full text-lg h-12 rounded-2xl transition-all shadow-lg hover:shadow-primary/20"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Connexion en cours...
									</>
								) : (
									"Se connecter"
								)}
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
