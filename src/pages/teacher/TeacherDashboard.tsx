import { useState, useRef, useMemo, useCallback } from "react";
import {
	Users,
	BookOpen,
	FileText,
	Search,
	TimerOff,
	Download,
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
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import AvailabilityCalendar from "@/components/academic/AvailabilityCalendar";

// --- Types & Components ---
import type {
	DefenseSession,
	StatMetric,
	SupervisedProject,
} from "@/pages/teacher/types";
import { StatCard } from "@/components/teacher/StatCard";
import { SupervisedProjectCard } from "@/components/teacher/SupervisedProjectCard";
import { StudentInfoDialog } from "@/components/teacher/StudentInfoDialog";
import { EvaluationDialog } from "@/components/teacher/EvaluationDialog";
import { DefenseTableRow } from "@/components/teacher/DefenseTableRow";

export default function TeacherDashboard() {
	const [selectedDefense, setSelectedDefense] = useState<DefenseSession | null>(
		null,
	);
	const [isInfoOpen, setIsInfoOpen] = useState(false);
	const [isEvalOpen, setIsEvalOpen] = useState(false);
	const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
	const calendarRef = useRef<HTMLDivElement>(null);

	const [unavailableSlots, setUnavailableSlots] = useState<
		Record<number, string[]>
	>({
		10: ["08:30 - 10:00", "10:15 - 11:45"],
		11: ["13:30 - 15:00"],
	});

	const teacherStats = useMemo<StatMetric[]>(
		() => [
			{
				title: "Soutenances (Jury)",
				value: "12",
				icon: Users,
				bg: "bg-primary/5",
			},
			{
				title: "Projets Encadrés",
				value: "05",
				icon: BookOpen,
				bg: "bg-primary/5",
			},
			{
				title: "Rapports Reçus",
				value: "08",
				icon: FileText,
				bg: "bg-primary/5",
			},
		],
		[],
	);

	const upcomingDefenses = useMemo<DefenseSession[]>(
		() => [
			{
				id: 1,
				groupName: "Groupe-Alpha",
				students: [
					{ name: "Mohamed Ali", cne: "D135678942" },
					{ name: "Yassine El Amrani", cne: "D135678943" },
					{ name: "Sara Belhaj", cne: "D135678944" },
					{ name: "Anas Idrissi", cne: "D135678945" },
					{ name: "Laila Mansouri", cne: "D135678946" },
				],
				project:
					"Système Intelligente de Gestion des dépenses et des budgets universitaires",
				date: "15 Juin 2026",
				day: 15,
				time: "08:30 - 10:00",
				room: "TD-05",
				role: "Président",
				status: "Confirmé",
			},
			{
				id: 2,
				groupName: "Groupe-Beta",
				students: [{ name: "Fatimah Zahra", cne: "G145223311" }],
				project: "Analyse des données massives avec Spark et Hadoop",
				date: "16 Juin 2026",
				day: 16,
				time: "10:15 - 11:45",
				room: "Salle B",
				role: "Rapporteur",
				status: "En attente",
			},
			{
				id: 3,
				groupName: "Groupe-Gamma",
				students: [
					{ name: "Karim Idrissi", cne: "E122998877" },
					{ name: "Sami Benjelloun", cne: "E122998878" },
				],
				project:
					"Sécurité des objets connectés (IoT) dans les environnements critiques",
				date: "18 Juin 2026",
				day: 18,
				time: "13:30 - 15:00",
				room: "Amphi C",
				role: "Examinateur",
				status: "Confirmé",
			},
		],
		[],
	);

	const supervisedProjects = useMemo<SupervisedProject[]>(
		() => [
			{
				id: 1,
				studentName: "Mohamed Ali",
				initials: "MA",
				filiere: "Qualité Logicielle",
				projectTitle:
					"Application mobile de suivi de performances en temps réel",
				progress: 75,
			},
			{
				id: 2,
				studentName: "Fatimah Zahra",
				initials: "FZ",
				filiere: "Big Data",
				projectTitle: "Pipeline ETL automatisé pour données de capteurs IoT",
				progress: 40,
			},
			{
				id: 3,
				studentName: "Karim Idrissi",
				initials: "KI",
				filiere: "Cyber-Sécurité",
				projectTitle: "Détection d'intrusions par apprentissage profond",
				progress: 90,
			},
		],
		[],
	);

	const handleAction = useCallback(
		(type: "info" | "eval", defense: DefenseSession) => {
			setSelectedDefense(defense);
			if (type === "info") setIsInfoOpen(true);
			if (type === "eval") setIsEvalOpen(true);
		},
		[],
	);

	const toggleGroup = useCallback((id: number) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id],
		);
	}, []);

	const toggleSlot = useCallback((day: number, slot: string) => {
		setUnavailableSlots((prev) => {
			const daySlots = prev[day] || [];
			const newDaySlots = daySlots.includes(slot)
				? daySlots.filter((s) => s !== slot)
				: [...daySlots, slot];

			return { ...prev, [day]: newDaySlots };
		});
	}, []);

	const scrollToCalendar = useCallback(() => {
		calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-heading font-bold text-foreground">
						Espace Enseignant & Jury
					</h1>
					<p className="text-muted-foreground font-sans text-lg">
						Suivi des plannings, consultation des dossiers et saisie des
						évaluations.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button
						variant="secondary"
						onClick={scrollToCalendar}
						className="gap-2 rounded-xl h-11 border border-border shadow-sm font-bold"
					>
						<TimerOff className="h-4 w-4" />
						Indisponibilités
					</Button>
					<Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 font-bold">
						<Download className="h-4 w-4" />
						Mission de Jury (PDF)
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{teacherStats.map((stat, i) => (
					<StatCard key={i} metric={stat} />
				))}
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="jury" className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<TabsList className="bg-muted/50 p-1 rounded-2xl border border-border">
						<TabsTrigger
							value="jury"
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm px-8 h-10 font-bold"
						>
							<Users className="h-4 w-4" /> Planning Jury
						</TabsTrigger>
						<TabsTrigger
							value="supervision"
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm px-8 h-10 font-bold"
						>
							<BookOpen className="h-4 w-4" /> Encadrements
						</TabsTrigger>
					</TabsList>

					<div className="relative w-full sm:w-72">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher une session..."
							className="pl-12 bg-card border-border rounded-xl h-11 shadow-sm focus:ring-primary/20"
						/>
					</div>
				</div>

				<TabsContent value="jury" className="space-y-6">
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
						<CardHeader className="bg-muted/20 border-b border-border p-10">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div>
									<CardTitle className="text-3xl font-heading text-foreground font-bold">
										Mon Planning Officiel
									</CardTitle>
									<CardDescription className="font-sans text-muted-foreground">
										Sessions de soutenance auxquelles vous êtes convoqué par
										l'administration.
									</CardDescription>
								</div>
								<Badge className="bg-primary/10 text-primary border-primary/20 px-5 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-sm">
									Session 2026
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/10">
									<TableRow className="hover:bg-transparent border-border">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Candidats (Groupe)
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Sujet du Projet
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Planification
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Lieu
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Rôle
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{upcomingDefenses.map((defense) => (
										<DefenseTableRow
											key={defense.id}
											defense={defense}
											isExpanded={expandedGroups.includes(defense.id)}
											onToggleExpand={toggleGroup}
											onAction={handleAction}
										/>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="supervision">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
						{supervisedProjects.map((p) => (
							<SupervisedProjectCard key={p.id} project={p} />
						))}
					</div>
				</TabsContent>
			</Tabs>

			{/* Availability Calendar Section */}
			<div ref={calendarRef} className="pt-10 scroll-mt-10">
				<AvailabilityCalendar
					unavailableSlots={unavailableSlots}
					onToggleSlot={toggleSlot}
					sessions={upcomingDefenses.map((d) => ({
						day: d.day,
						time: d.time,
						student: d.students.map((s) => s.name).join(", "),
						room: d.room,
					}))}
					onSave={() => alert("Vos disponibilités ont été mises à jour.")}
				/>
			</div>

			{/* Dialogs */}
			<StudentInfoDialog
				isOpen={isInfoOpen}
				onClose={() => setIsInfoOpen(false)}
				defense={selectedDefense}
			/>

			<EvaluationDialog
				isOpen={isEvalOpen}
				onClose={() => setIsEvalOpen(false)}
				defense={selectedDefense}
			/>
		</div>
	);
}
