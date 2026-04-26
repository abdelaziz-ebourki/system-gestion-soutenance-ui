import React from "react";
import { useNavigate } from "react-router-dom";
import {
	Landmark,
	ShieldCheck,
	UserCircle,
	Users,
	BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Login: React.FC = () => {
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = (role: UserRole) => {
		login(role);
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-[#fcfcf9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Decorative Background Elements */}
			<div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
			<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

			<div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center z-10">
				<div className="space-y-6 text-center md:text-left">
					<div className="flex items-center justify-center md:justify-start gap-4 mb-8">
						<img src="/logo.svg" alt="Logo" className="h-16 w-16" />
						<div>
							<h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
								SG Soutenances
							</h1>
							<p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">
								University Management System
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

				<Card className="border-2 shadow-2xl bg-white/80 backdrop-blur-md">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-3xl font-heading font-bold">
							Connexion
						</CardTitle>
						<CardDescription>
							Choisissez votre profil pour accéder à votre espace
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid grid-cols-2 gap-3">
							<Button
								variant="outline"
								className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
								onClick={() => handleLogin("STUDENT")}
							>
								<UserCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
								<span>Étudiant</span>
							</Button>
							<Button
								variant="outline"
								className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
								onClick={() => handleLogin("TEACHER")}
							>
								<Users className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
								<span>Enseignant</span>
							</Button>
							<Button
								variant="outline"
								className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
								onClick={() => handleLogin("COORDINATOR")}
							>
								<BookOpen className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
								<span>Coordinateur</span>
							</Button>
							<Button
								variant="outline"
								className="h-24 flex-col gap-2 hover:border-primary hover:bg-primary/5 group"
								onClick={() => handleLogin("ADMIN")}
							>
								<ShieldCheck className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
								<span>Admin</span>
							</Button>
						</div>

						<div className="relative py-4">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Identifiants
								</span>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email académique</Label>
							<Input
								id="email"
								type="email"
								placeholder="nom.prenom@univ.dz"
								disabled
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Mot de passe</Label>
							<Input id="password" type="password" disabled />
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full text-lg h-12" disabled>
							Se connecter
						</Button>
					</CardFooter>
				</Card>
			</div>

			<footer className="absolute bottom-8 text-sm text-muted-foreground flex gap-6">
				<span>© 2026 Copyright</span>
				<span className="hover:text-primary cursor-pointer">Assistance</span>
				<span className="hover:text-primary cursor-pointer">
					Mentions Légales
				</span>
			</footer>
		</div>
	);
};

export default Login;
