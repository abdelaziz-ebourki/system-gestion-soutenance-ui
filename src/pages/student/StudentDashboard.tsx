import * as React from "react";
import { CalendarDays, Download, GraduationCap, Loader2, Users } from "lucide-react";

import {
	getStudentConvocation,
	getStudentDefense,
	getStudentStats,
} from "@/lib/api";
import type { StudentDefenseDetails, StudentStats } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
	const [stats, setStats] = React.useState<StudentStats | null>(null);
	const [defense, setDefense] = React.useState<StudentDefenseDetails | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDownloading, setIsDownloading] = React.useState(false);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsData, defenseData] = await Promise.all([
					getStudentStats(),
					getStudentDefense(),
				]);
				setStats(statsData);
				setDefense(defenseData);
			} catch {
				toast.error("Erreur lors du chargement de votre espace");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleConvocationDownload = async () => {
		setIsDownloading(true);
		try {
			const blob = await getStudentConvocation();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "convocation-soutenance.pdf";
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Impossible de telecharger la convocation";
			toast.error(message);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="space-y-6">
			<section className="rounded-[28px] border bg-card shadow-sm">
				<div className="grid gap-6 px-6 py-8 md:grid-cols-[1.35fr_1fr] md:px-8">
					<div className="space-y-4">
						<Badge className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
							Ma soutenance
						</Badge>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
								Toutes les informations utiles a votre soutenance, au meme endroit.
							</h1>
							<p className="max-w-2xl text-sm text-muted-foreground md:text-base">
								Consultez votre planning, votre jury, vos documents et votre
								convocation sans passer par plusieurs ecrans.
							</p>
						</div>
					</div>

					<Card className="bg-secondary/40 shadow-none">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Etat du dossier</CardTitle>
							<CardDescription>
								Un resume rapide avant la soutenance.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="rounded-2xl border bg-background/80 p-4">
								<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
									Statut
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{defense?.status === "scheduled" ? "Planifiee" : "En attente"}
								</p>
							</div>
							{defense?.date && (
								<div className="rounded-2xl border bg-background/80 p-4 text-sm text-muted-foreground">
									{defense.date} · {defense.startTime} - {defense.endTime} ·{" "}
									{defense.roomName}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</section>

			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Statut soutenance</p>
							<p className="mt-2 text-xl font-semibold">
								{stats?.defenseStatus === "scheduled" ? "Planifiee" : "En attente"}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<GraduationCap className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Membres du groupe</p>
							<p className="mt-2 text-3xl font-semibold">{stats?.groupMembers}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<Users className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Documents suivis</p>
							<p className="mt-2 text-3xl font-semibold">{stats?.documentCount}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<Download className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Pieces manquantes</p>
							<p className="mt-2 text-3xl font-semibold">{stats?.missingDocuments}</p>
						</div>
						<div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
							<CalendarDays className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Fiche de soutenance</CardTitle>
						<CardDescription>
							Le sujet, l'encadrement et le planning associes a votre dossier.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-2xl border p-5">
							<p className="text-sm text-muted-foreground">Projet</p>
							<p className="mt-2 text-xl font-semibold">{defense?.projectTitle}</p>
							<p className="mt-3 text-sm text-muted-foreground">
								{defense?.projectDescription}
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl border p-4">
								<p className="text-sm text-muted-foreground">Encadrant</p>
								<p className="mt-2 font-medium">{defense?.supervisorName}</p>
							</div>
							<div className="rounded-2xl border p-4">
								<p className="text-sm text-muted-foreground">Horaire</p>
								<p className="mt-2 font-medium">
									{isLoading
										? "Chargement..."
										: defense?.date
											? `${defense.date} · ${defense.startTime} - ${defense.endTime}`
											: "En attente de planification"}
								</p>
							</div>
						</div>
						{defense?.status === "scheduled" ? (
							<Button
								variant="outline"
								className="w-fit"
								onClick={handleConvocationDownload}
								disabled={isDownloading}
							>
								{isDownloading && <Loader2 className="mr-2 size-4 animate-spin" />}
								Telecharger la convocation
							</Button>
						) : (
							<Link
								to="/student/group"
								className={buttonVariants({ variant: "outline" })}
							>
								Creez ou rejoignez un groupe
							</Link>
						)}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Composition du jury</CardTitle>
						<CardDescription>
							Les membres actuellement associes a votre soutenance.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{defense?.juryMembers.map((member) => (
							<div key={`${member.role}-${member.name}`} className="rounded-2xl border p-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<p className="font-medium">{member.name}</p>
									<Badge variant="outline">{member.role}</Badge>
								</div>
							</div>
						))}
						{defense?.result && (
							<div className="rounded-2xl border bg-secondary p-4">
								<p className="text-sm text-muted-foreground">Resultat</p>
								<p className="mt-2 font-semibold">{defense.result.decision}</p>
								{defense.result.score !== undefined && (
									<p className="mt-1 text-sm text-muted-foreground">
										Note finale: {defense.result.score}/20
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
