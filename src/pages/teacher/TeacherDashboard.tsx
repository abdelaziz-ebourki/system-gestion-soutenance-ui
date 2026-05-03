import { useState, useRef, useMemo } from "react";
import {
	Clock,
	Users,
	BookOpen,
	FileText,
	Search,
	User,
	MapPin,
	ClipboardCheck,
	X,
	Save,
	TimerOff,
	Download,
	ChevronDown,
	ChevronUp,
	ExternalLink,
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
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvailabilityCalendar from "@/components/academic/AvailabilityCalendar";

// --- Interfaces & Types ---

interface Candidate {
	name: string;
	cne: string;
}

interface DefenseSession {
	id: number;
	groupName: string;
	students: Candidate[];
	project: string;
	date: string;
	day: number;
	time: string;
	room: string;
	role: "Président" | "Rapporteur" | "Examinateur" | string;
	status: "Confirmé" | "En attente" | "Terminé" | string;
}

interface StatMetric {
	title: string;
	value: string;
	icon: React.ElementType;
	bg: string;
}

interface SupervisedProject {
	id: number;
	studentName: string;
	initials: string;
	filiere: string;
	projectTitle: string;
	progress: number;
}

// --- Refactored Sub-components ---

const StudentInfoDialog = ({
	isOpen,
	onClose,
	defense,
}: {
	isOpen: boolean;
	onClose: () => void;
	defense: DefenseSession | null;
}) => {
	if (!isOpen || !defense) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-lg bg-card shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
				<div className="p-6 border-b flex justify-between items-center bg-muted/30">
					<h2 className="text-xl font-heading font-bold text-foreground">
						Dossier des Candidats
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full hover:bg-muted"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="p-8 space-y-6">
					<div className="space-y-4">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
							Binôme / Groupe d'Étudiants
						</p>
						{defense.students.map((s, idx) => (
							<div
								key={idx}
								className="flex items-center gap-6 p-4 bg-secondary/50 rounded-2xl border border-border"
							>
								<div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shadow-inner">
									{s.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</div>
								<div className="space-y-1">
									<h3 className="text-lg font-heading font-bold text-foreground">
										{s.name}
									</h3>
									<p className="text-primary text-xs font-medium">{s.cne}</p>
									<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
										Master Qualité Logicielle
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="space-y-2 pt-2">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
							Sujet de PFE
						</p>
						<div className="p-5 bg-foreground text-background rounded-2xl border italic text-sm leading-relaxed shadow-xl">
							"{defense.project}"
						</div>
					</div>
					<Button
						className="w-full gap-2 h-12 rounded-xl font-bold"
						variant="outline"
					>
						<FileText className="h-4 w-4" /> Consulter le Rapport Complet
					</Button>
				</div>
			</div>
		</div>
	);
};

const EvaluationDialog = ({
	isOpen,
	onClose,
	defense,
}: {
	isOpen: boolean;
	onClose: () => void;
	defense: DefenseSession | null;
}) => {
	const [evaluations, setEvaluations] = useState<
		Record<string, { note: string; obs: string }>
	>({});

	if (!isOpen || !defense) return null;

	const handleSave = () => {
		console.log("Saving evaluations:", evaluations);
		alert("PV de soutenance enregistré avec succès.");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-2xl bg-card shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
				<div className="p-6 border-b flex justify-between items-center bg-primary/5">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg text-primary">
							<ClipboardCheck className="h-5 w-5" />
						</div>
						<h2 className="text-xl font-heading font-bold text-foreground">
							Saisie des Notes (PV de Groupe)
						</h2>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
					<div className="p-5 bg-muted/30 rounded-2xl mb-4 border-l-4 border-primary">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
							Projet de Soutenance
						</p>
						<p className="font-heading font-bold italic text-foreground/80 leading-snug">
							"{defense.project}"
						</p>
					</div>

					{defense.students.map((s, idx) => (
						<div
							key={idx}
							className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
						>
							<div className="flex justify-between items-center border-b border-border pb-4">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
										{idx + 1}
									</div>
									<span className="font-bold text-foreground">{s.name}</span>
								</div>
								<Badge variant="secondary" className="font-mono text-[10px]">
									{s.cne}
								</Badge>
							</div>
							<div className="grid sm:grid-cols-4 gap-6">
								<div className="sm:col-span-1 space-y-2">
									<Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
										Note / 20
									</Label>
									<Input
										type="number"
										placeholder="00"
										className="text-lg font-bold h-12 bg-muted/20"
										onChange={(e) =>
											setEvaluations({
												...evaluations,
												[s.cne]: {
													...(evaluations[s.cne] || { obs: "" }),
													note: e.target.value,
												},
											})
										}
									/>
								</div>
								<div className="sm:col-span-3 space-y-2">
									<Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
										Appréciations
									</Label>
									<Input
										placeholder="Remarques pour cet étudiant..."
										className="h-12 bg-muted/20"
										onChange={(e) =>
											setEvaluations({
												...evaluations,
												[s.cne]: {
													...(evaluations[s.cne] || { note: "" }),
													obs: e.target.value,
												},
											})
										}
									/>
								</div>
							</div>
						</div>
					))}

					<div className="flex gap-4 pt-4">
						<Button
							variant="ghost"
							onClick={onClose}
							className="flex-1 rounded-xl h-12"
						>
							Annuler
						</Button>
						<Button
							onClick={handleSave}
							className="flex-1 rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<Save className="h-4 w-4" /> Enregistrer le PV
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

const StatCard = ({ metric }: { metric: StatMetric }) => (
	<Card className="border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all rounded-3xl bg-card">
		<CardContent className="p-8">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-1">
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
						{metric.title}
					</p>
					<p className="text-4xl font-bold font-heading text-foreground">
						{metric.value}
					</p>
				</div>
				<div
					className={`p-4 rounded-3xl ${metric.bg} group-hover:scale-110 transition-transform shadow-inner border border-primary/5`}
				>
					<metric.icon className="h-8 w-8 text-primary" />
				</div>
			</div>
		</CardContent>
	</Card>
);

const SupervisedProjectCard = ({ project }: { project: SupervisedProject }) => (
	<Card className="group hover:shadow-xl transition-all border border-border relative overflow-hidden rounded-[2rem] bg-card">
		<div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
		<CardHeader className="pb-4">
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-4">
					<div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5">
						{project.initials}
					</div>
					<div>
						<CardTitle className="text-lg font-heading font-bold text-foreground">
							{project.studentName}
						</CardTitle>
						<CardDescription className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
							{project.filiere}
						</CardDescription>
					</div>
				</div>
				<Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-3 text-[10px] font-bold">
					En cours
				</Badge>
			</div>
		</CardHeader>
		<CardContent className="space-y-6">
			<div className="p-4 bg-muted/30 rounded-2xl text-xs italic border border-border/50 group-hover:bg-background transition-colors leading-relaxed">
				"{project.projectTitle}"
			</div>
			<div className="space-y-2">
				<div className="flex justify-between items-center text-xs">
					<span className="text-muted-foreground font-medium">Progression</span>
					<span className="font-bold text-primary">{project.progress}%</span>
				</div>
				<div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/50 p-0.5">
					<div
						className="bg-primary h-full rounded-full shadow-sm transition-all duration-1000"
						style={{ width: `${project.progress}%` }}
					/>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Button
					size="sm"
					className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 font-bold"
				>
					<FileText className="h-4 w-4" /> Rapport
				</Button>
				<Button
					size="sm"
					variant="outline"
					className="gap-2 border-border hover:bg-muted rounded-xl h-10 font-bold"
				>
					<ExternalLink className="h-4 w-4" /> Dossier
				</Button>
			</div>
		</CardContent>
	</Card>
);

// --- Main Dashboard Component ---

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

	const handleAction = (type: "info" | "eval", defense: DefenseSession) => {
		setSelectedDefense(defense);
		if (type === "info") setIsInfoOpen(true);
		if (type === "eval") setIsEvalOpen(true);
	};

	const toggleGroup = (id: number) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id],
		);
	};

	const toggleSlot = (day: number, slot: string) => {
		setUnavailableSlots((prev) => {
			const daySlots = prev[day] || [];
			const newDaySlots = daySlots.includes(slot)
				? daySlots.filter((s) => s !== slot)
				: [...daySlots, slot];

			return { ...prev, [day]: newDaySlots };
		});
	};

	const scrollToCalendar = () => {
		calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

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
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-[2rem]">
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
									{upcomingDefenses.map((defense) => {
										const isExpanded = expandedGroups.includes(defense.id);
										return (
											<TableRow
												key={defense.id}
												className={`transition-all border-border group ${isExpanded ? "bg-primary/[0.03]" : "hover:bg-muted/20"}`}
											>
												<TableCell className="p-6 align-top">
													<div className="space-y-3">
														<button
															onClick={() => toggleGroup(defense.id)}
															className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl hover:border-primary/50 transition-all shadow-sm group/btn"
														>
															<div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold group-hover/btn:scale-110 transition-transform">
																{defense.students.length}
															</div>
															<div className="flex flex-col items-start">
																<span className="font-bold text-foreground text-sm tracking-tight">
																	{defense.groupName}
																</span>
																<span className="text-[9px] text-primary uppercase font-bold tracking-tighter flex items-center gap-1.5 opacity-80">
																	{isExpanded ? (
																		<ChevronUp className="h-3 w-3" />
																	) : (
																		<ChevronDown className="h-3 w-3" />
																	)}
																	{isExpanded ? "Fermer" : "Membres"}
																</span>
															</div>
														</button>

														{isExpanded && (
															<div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
																{defense.students.map((s, idx) => (
																	<div
																		key={idx}
																		className="flex items-center gap-3 pl-4 py-2 border-l-2 border-primary/20 bg-muted/10 rounded-r-xl"
																	>
																		<div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-[10px] font-bold text-primary">
																			{s.name
																				.split(" ")
																				.map((n) => n[0])
																				.join("")}
																		</div>
																		<div className="flex flex-col">
																			<span className="text-xs font-bold text-foreground leading-none mb-1">
																				{s.name}
																			</span>
																			<span className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">
																				{s.cne}
																			</span>
																		</div>
																	</div>
																))}
															</div>
														)}
													</div>
												</TableCell>
												<TableCell className="p-6 max-w-[250px] align-top">
													<p className="text-sm italic text-muted-foreground line-clamp-3 leading-relaxed font-serif">
														"{defense.project}"
													</p>
												</TableCell>
												<TableCell className="p-6 align-top">
													<div className="flex flex-col gap-2">
														<span className="font-bold text-sm text-foreground bg-muted/40 px-3 py-1 rounded-lg w-fit">
															{defense.date}
														</span>
														<span className="text-[10px] text-primary flex items-center gap-1.5 uppercase font-bold tracking-wider px-3">
															<Clock className="h-3 w-3" /> {defense.time}
														</span>
													</div>
												</TableCell>
												<TableCell className="p-6 align-top">
													<div className="flex items-center gap-2 text-sm font-medium text-foreground px-3 py-1 rounded-xl border border-border bg-secondary shadow-sm w-fit">
														<MapPin className="h-4 w-4 text-primary" />
														<span>{defense.room}</span>
													</div>
												</TableCell>
												<TableCell className="p-6 align-top">
													<Badge
														variant="outline"
														className={`px-4 rounded-full border-primary/20 text-primary font-bold ${
															defense.role === "Président"
																? "bg-primary/5"
																: "bg-muted"
														}`}
													>
														{defense.role}
													</Badge>
												</TableCell>
												<TableCell className="p-6 text-right align-top">
													<div className="flex justify-end gap-2">
														<Button
															variant="outline"
															size="icon"
															className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-sm"
															title="Dossier Étudiants"
															onClick={() => handleAction("info", defense)}
														>
															<User className="h-4 w-4" />
														</Button>
														<Button
															variant="outline"
															size="icon"
															className="h-10 w-10 rounded-xl border-border hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 shadow-sm"
															title="Saisir PV"
															onClick={() => handleAction("eval", defense)}
														>
															<ClipboardCheck className="h-4 w-4" />
														</Button>
														<Button
															variant="outline"
															size="icon"
															className="h-10 w-10 rounded-xl border-border hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 shadow-sm"
															title="Exporter PV"
														>
															<Download className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
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
					monthName="Juin"
					year={2026}
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
