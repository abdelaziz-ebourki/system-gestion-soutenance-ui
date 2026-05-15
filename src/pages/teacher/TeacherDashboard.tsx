import * as React from "react";
import {
	ClipboardCheck,
	Clock3,
	FileCheck2,
	ShieldCheck,
} from "lucide-react";

import {
	getTeacherEvaluations,
	getTeacherSchedule,
	getTeacherStats,
} from "@/lib/api";
import type { TeacherDefense, TeacherEvaluation, TeacherStats } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const roleLabel: Record<TeacherDefense["role"], string> = {
	president: "President",
	reporter: "Rapporteur",
	examiner: "Examinateur",
	supervisor: "Encadrant",
};

export default function TeacherDashboard() {
	const [stats, setStats] = React.useState<TeacherStats | null>(null);
	const [schedule, setSchedule] = React.useState<TeacherDefense[]>([]);
	const [evaluations, setEvaluations] = React.useState<TeacherEvaluation[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsData, scheduleData, evaluationsData] = await Promise.all([
					getTeacherStats(),
					getTeacherSchedule(),
					getTeacherEvaluations(),
				]);
				setStats(statsData);
				setSchedule(scheduleData);
				setEvaluations(evaluationsData);
			} catch {
				toast.error("Erreur lors du chargement de l'espace enseignant");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const upcomingDefenses = schedule
		.filter((defense) => defense.status === "scheduled")
		.slice(0, 3);
	const pendingEvaluations = evaluations.filter(
		(evaluation) => evaluation.status === "pending",
	);

	return (
		<div className="space-y-6">
			<section className="rounded-[28px] border bg-card shadow-sm">
				<div className="grid gap-6 px-6 py-8 md:grid-cols-[1.4fr_1fr] md:px-8">
					<div className="space-y-4">
						<Badge className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
							Session de soutenance
						</Badge>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
								Un espace enseignant clair pour suivre jurys, planning et notes.
							</h1>
							<p className="max-w-2xl text-sm text-muted-foreground md:text-base">
								Retrouvez vos passages a venir, les evaluations a rendre et vos
								indisponibilites depuis un point d'entree unique.
							</p>
						</div>
					</div>

					<Card className="bg-secondary/40 shadow-none">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Vue rapide</CardTitle>
							<CardDescription>
								Les indicateurs utiles avant le debut des soutenances.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3 sm:grid-cols-2">
							<div className="rounded-2xl border bg-background/80 p-4">
								<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
									A venir
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{isLoading ? <Skeleton className="h-8 w-12" /> : stats?.upcomingDefenses}
								</p>
							</div>
							<div className="rounded-2xl border bg-background/80 p-4">
								<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
									Notes
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{isLoading ? <Skeleton className="h-8 w-12" /> : stats?.pendingEvaluations}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Soutenances a venir",
						value: stats?.upcomingDefenses,
						icon: Clock3,
					},
					{
						label: "Evaluations en attente",
						value: stats?.pendingEvaluations,
						icon: FileCheck2,
					},
					{
						label: "Creneaux bloques",
						value: stats?.declaredUnavailabilitySlots,
						icon: ClipboardCheck,
					},
					{
						label: "Jurys assignes",
						value: stats?.juryAssignments,
						icon: ShieldCheck,
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

			<section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Prochaines soutenances</CardTitle>
						<CardDescription>
							Les passages ou votre presence est requise prochainement.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{upcomingDefenses.map((defense) => (
							<div key={defense.id} className="rounded-2xl border p-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-medium">{defense.projectTitle}</p>
										<p className="mt-1 text-sm text-muted-foreground">
											{defense.studentNames.join(", ")}
										</p>
									</div>
									<Badge className="bg-secondary text-secondary-foreground">
										{roleLabel[defense.role]}
									</Badge>
								</div>
								<div className="mt-3 text-sm text-muted-foreground">
									{defense.date} · {defense.startTime} - {defense.endTime} ·{" "}
									{defense.roomName}
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Evaluations a rendre</CardTitle>
						<CardDescription>
							Les dossiers qui demandent encore une note ou un commentaire.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{pendingEvaluations.map((evaluation) => (
							<div key={evaluation.id} className="rounded-2xl border p-4">
								<p className="font-medium">{evaluation.projectTitle}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{evaluation.studentNames.join(", ")}
								</p>
								<div className="mt-3">
									<Badge variant="outline">{roleLabel[evaluation.role]}</Badge>
								</div>
							</div>
						))}
						{!isLoading && pendingEvaluations.length === 0 && (
							<div className="rounded-2xl border bg-secondary p-4 text-sm text-secondary-foreground">
								Aucune evaluation en attente.
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
