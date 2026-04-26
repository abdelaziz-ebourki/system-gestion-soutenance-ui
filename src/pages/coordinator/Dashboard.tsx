import React from "react";
import {
	Calendar,
	Users,
	DoorOpen,
	AlertCircle,
	TrendingUp,
	Clock,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CoordinatorDashboard: React.FC = () => {
	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">Coordination</h1>
					<p className="text-muted-foreground">
						Supervisez la planification et la logistique des sessions de
						soutenance.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="gap-2 text-primary hover:text-primary/80">
						<Calendar className="h-4 w-4" />
						Voir Calendrier
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-4 gap-4">
				<Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<TrendingUp className="h-8 w-8 opacity-50" />
							<Badge variant="outline" className="text-white border-white/20">
								Session Juin
							</Badge>
						</div>
						<div className="mt-4">
							<p className="text-4xl font-bold">142</p>
							<p className="text-sm text-primary-foreground/70 uppercase tracking-wider font-medium">
								Soutenances prévues
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="p-3 bg-primary/10 rounded-xl">
								<DoorOpen className="h-6 w-6 text-primary" />
							</div>
							<span className="text-xs font-bold text-muted-foreground uppercase">85% occupé</span>
						</div>
						<div className="mt-4">
							<p className="text-4xl font-bold">12 / 14</p>
							<p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
								Salles utilisées
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="p-3 bg-primary/10 rounded-xl">
								<Users className="h-6 w-6 text-primary" />
							</div>
							<span className="text-xs font-bold text-muted-foreground uppercase">45 membres</span>
						</div>
						<div className="mt-4">
							<p className="text-4xl font-bold">18</p>
							<p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
								Jury à confirmer
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-destructive/20 bg-destructive/5">
					<CardContent className="p-6">
						<div className="flex items-center justify-between text-destructive">
							<AlertCircle className="h-8 w-8" />
							<span className="text-xs font-bold uppercase">Urgent</span>
						</div>
						<div className="mt-4">
							<p className="text-4xl font-bold text-destructive">5</p>
							<p className="text-sm text-destructive uppercase tracking-wider font-medium font-heading">
								Conflits détectés
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="font-heading">
							Activité de planification
						</CardTitle>
						<CardDescription>
							Dernières modifications apportées au planning.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{[
							{
								action: "Salle modifiée",
								detail: "Soutenance de Sarah K. déplacée vers B-204",
								time: "Il y a 10 min",
								user: "Admin",
							},
							{
								action: "Jury assigné",
								detail: "Pr. Ahmed Alami ajouté à la session 4",
								time: "Il y a 1h",
								user: "System",
							},
							{
								action: "Conflit résolu",
								detail: "Double réservation salle S-12 annulée",
								time: "Il y a 3h",
								user: "Admin",
							},
							{
								action: "Nouvelle session",
								detail: "Création de la session du 25 Juin",
								time: "Hier",
								user: "Coordinateur",
							},
						].map((log, i) => (
							<div
								key={i}
								className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"
							>
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
									<Clock className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 overflow-hidden">
									<div className="flex items-center justify-between">
										<p className="text-sm font-bold">{log.action}</p>
										<span className="text-[10px] text-muted-foreground uppercase">
											{log.time}
										</span>
									</div>
									<p className="text-sm text-muted-foreground truncate">
										{log.detail}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg font-heading">Raccourcis</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-2">
							<Button
								variant="outline"
								className="w-full justify-start gap-3 h-12 text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
							>
								<Users className="h-4 w-4" />
								Gérer les membres du Jury
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start gap-3 h-12 text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
							>
								<DoorOpen className="h-4 w-4" />
								Disponibilité des salles
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start gap-3 h-12 text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
							>
								<Calendar className="h-4 w-4" />
								Générer les convocations
							</Button>
						</CardContent>
					</Card>

					<Card className="border-primary bg-primary/5">
						<CardHeader>
							<CardTitle className="text-lg font-heading">
								Statut Global
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-xs font-bold uppercase">
										<span>Progression Planning</span>
										<span>75%</span>
									</div>
									<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
										<div className="h-full bg-primary w-[75%]" />
									</div>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-xs font-bold uppercase">
										<span>Validation Jurys</span>
										<span>40%</span>
									</div>
									<div className="h-2 w-full bg-muted rounded-full overflow-hidden">
										<div className="h-full bg-primary w-[40%]" />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CoordinatorDashboard;
