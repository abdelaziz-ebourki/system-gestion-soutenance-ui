import * as React from "react";
import { Link } from "react-router-dom";
import {
	ArrowRight,
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	Clock3,
	Sparkles,
	Users,
} from "lucide-react";

import { getCoordinatorStats, getProjects, getJurys } from "@/lib/api";
import type { CoordinatorStats } from "@/lib/api";
import type { Jury, Project } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const actionCards = [
	{
		title: "Projets & Groupes",
		description: "Affectations, encadrants et suivi des depots.",
		to: "/coordinator/projects",
		icon: BookOpen,
	},
	{
		title: "Jurys",
		description: "Composer les jurys et equilibrer les roles.",
		to: "/coordinator/jurys",
		icon: Users,
	},
	{
		title: "Planification",
		description: "Orchestrer les salles, creneaux et passages.",
		to: "/coordinator/schedule",
		icon: CalendarDays,
	},
];

export default function CoordinatorDashboard() {
	const [stats, setStats] = React.useState<CoordinatorStats | null>(null);
	const [projects, setProjects] = React.useState<Project[]>([]);
	const [jurys, setJurys] = React.useState<Jury[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsData, projectsData, jurysData] = await Promise.all([
					getCoordinatorStats(),
					getProjects(),
					getJurys(),
				]);
				setStats(statsData);
				setProjects(projectsData);
				setJurys(jurysData);
			} catch {
				toast.error("Erreur lors du chargement de l'espace coordinateur");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const readyProjects = projects.filter((project) => project.status === "approved");
	const projectsWithoutJury = projects.filter(
		(project) => !jurys.some((jury) => jury.projectId === project.id),
	);
	const juryCoverage =
		projects.length > 0 ? Math.round((jurys.length / projects.length) * 100) : 0;

	return (
		<div className="space-y-6">
			<section className="overflow-hidden rounded-[28px] border bg-card shadow-sm">
				<div className="grid gap-6 px-6 py-8 md:grid-cols-[1.5fr_1fr] md:px-8">
					<div className="space-y-4">
						<Badge className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
							Campagne de soutenance 2026
						</Badge>
						<div className="space-y-2">
							<h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
								Coordination des soutenances, pensee comme une salle de controle.
							</h1>
							<p className="max-w-2xl text-sm text-muted-foreground md:text-base">
								Suivez la progression des projets, la couverture des jurys et la
								preparation du planning depuis un seul point d'entree.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link
								to="/coordinator/schedule"
								className={buttonVariants({ size: "lg" })}
							>
								Ouvrir le planificateur
							</Link>
							<Link
								to="/coordinator/jurys"
								className={buttonVariants({ variant: "outline", size: "lg" })}
							>
								Verifier les jurys
							</Link>
						</div>
					</div>

					<Card className="bg-secondary/40 shadow-none">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<Sparkles className="size-4 text-primary" />
								Etat de preparation
							</CardTitle>
							<CardDescription>
								Les points qui demandent encore une intervention.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-2xl border bg-background/80 p-4">
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<span>Couverture des jurys</span>
									<span>{juryCoverage}%</span>
								</div>
								<div className="mt-3 h-2 rounded-full bg-secondary">
									<div
										className="h-2 rounded-full bg-primary"
										style={{ width: `${Math.min(juryCoverage, 100)}%` }}
									/>
								</div>
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="rounded-2xl border bg-background/80 p-4">
									<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
										Prets
									</p>
									<p className="mt-2 text-2xl font-semibold">
										{isLoading ? <Skeleton className="h-8 w-16" /> : readyProjects.length}
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Projets approuves
									</p>
								</div>
								<div className="rounded-2xl border bg-background/80 p-4">
									<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
										A completer
									</p>
									<p className="mt-2 text-2xl font-semibold">
										{isLoading ? (
											<Skeleton className="h-8 w-16" />
										) : (
											projectsWithoutJury.length
										)}
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Projets sans jury
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Projets",
						value: stats?.totalProjects,
						icon: BookOpen,
					},
					{
						label: "Groupes",
						value: stats?.totalGroups,
						icon: Users,
					},
					{
						label: "Jurys",
						value: stats?.totalJuries,
						icon: ClipboardCheck,
					},
					{
						label: "Creneaux planifies",
						value: stats?.scheduledDefenses,
						icon: Clock3,
					},
				].map((item) => (
					<Card key={item.label} className="border-0 shadow-sm">
						<CardContent className="flex items-center justify-between p-5">
							<div>
								<p className="text-sm text-muted-foreground">{item.label}</p>
								<p className="mt-2 text-3xl font-semibold tracking-tight">
									{isLoading ? <Skeleton className="h-9 w-14" /> : item.value}
								</p>
							</div>
							<div className="rounded-2xl bg-secondary p-3 text-primary">
								<item.icon className="size-5" />
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Acces directs</CardTitle>
						<CardDescription>
							Des points d'entree clairs pour boucler la campagne plus vite.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-3">
						{actionCards.map((card) => (
							<Link
								key={card.title}
								to={card.to}
								className="group rounded-[24px] border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
							>
								<div className="mb-4 inline-flex rounded-2xl bg-secondary p-3 text-primary">
									<card.icon className="size-5" />
								</div>
								<div className="space-y-2">
									<h2 className="font-semibold">{card.title}</h2>
									<p className="text-sm text-muted-foreground">
										{card.description}
									</p>
								</div>
								<div className="mt-6 flex items-center text-sm font-medium text-foreground">
									Ouvrir
									<ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" />
								</div>
							</Link>
						))}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Points d'attention</CardTitle>
						<CardDescription>
							Les dossiers qui bloquent le passage a la planification finale.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{projectsWithoutJury.slice(0, 4).map((project) => (
							<div
								key={project.id}
								className="rounded-2xl border border-dashed p-4"
							>
								<p className="font-medium">{project.title}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Encadrant: {project.supervisorName}
								</p>
							</div>
						))}
						{!isLoading && projectsWithoutJury.length === 0 && (
							<div className="rounded-2xl border bg-secondary p-4 text-sm text-secondary-foreground">
								Tous les projets disposent deja d'un jury.
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
