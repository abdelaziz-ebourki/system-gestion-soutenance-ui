import { useState, useRef } from "react";
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

// --- Sub-components for Dialogs ---

const StudentInfoDialog = ({ isOpen, onClose, student }: any) => {
	if (!isOpen || !student) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="p-6 border-b flex justify-between items-center bg-slate-50">
					<h2 className="text-xl font-heading font-bold">
						Informations Étudiant
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="p-8 space-y-6">
					<div className="flex items-center gap-6">
						<div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shadow-inner">
							{student.student
								.split(" ")
								.map((n: any) => n[0])
								.join("")}
						</div>
						<div className="space-y-1">
							<h3 className="text-2xl font-heading font-bold">
								{student.student}
							</h3>
							<p className="text-primary font-medium">{student.cne}</p>
							<Badge
								variant="outline"
								className="bg-primary/5 text-primary border-primary/20"
							>
								Master Qualité Logicielle
							</Badge>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 pt-4">
						<div className="space-y-1">
							<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
								Email Académique
							</p>
							<p className="text-sm font-medium">
								{student.student.toLowerCase().replace(" ", ".")}@univ.dz
							</p>
						</div>
						<div className="space-y-1">
							<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
								Téléphone
							</p>
							<p className="text-sm font-medium">+213 (0) 555 00 11 22</p>
						</div>
					</div>
					<div className="space-y-2 pt-4">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
							Sujet de PFE
						</p>
						<div className="p-4 bg-slate-50 rounded-xl border italic text-sm text-slate-700 leading-relaxed">
							"{student.project}"
						</div>
					</div>
					<Button className="w-full gap-2" variant="outline">
						<FileText className="h-4 w-4" /> Consulter le Rapport complet
					</Button>
				</div>
			</div>
		</div>
	);
};

const EvaluationDialog = ({ isOpen, onClose, student }: any) => {
	const [note, setNote] = useState("");
	const [observations, setObservations] = useState("");

	if (!isOpen || !student) return null;

	const handleSave = () => {
		alert(
			`Évaluation enregistrée pour ${student.student}\nNote: ${note}\nObservations: ${observations}`,
		);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-xl bg-white shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
				<div className="p-6 border-b flex justify-between items-center bg-amber-50/30">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-amber-100 rounded-lg text-amber-700">
							<ClipboardCheck className="h-5 w-5" />
						</div>
						<h2 className="text-xl font-heading font-bold text-slate-800">
							Saisie de l'Évaluation
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
				<div className="p-8 space-y-6">
					<div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
						<div>
							<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
								Candidat
							</p>
							<p className="font-heading font-bold text-lg">
								{student.student}
							</p>
						</div>
						<Badge className="bg-slate-900 text-white">{student.role}</Badge>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label
								htmlFor="note"
								className="text-xs uppercase font-bold tracking-widest"
							>
								Note sur 20
							</Label>
							<Input
								id="note"
								type="number"
								placeholder="00.00"
								max={20}
								min={0}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								className="text-lg font-bold h-12 border-slate-200 focus:ring-primary/20"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="obs"
								className="text-xs uppercase font-bold tracking-widest"
							>
								Observations & Appréciations
							</Label>
							<textarea
								id="obs"
								className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
								placeholder="Saisissez vos remarques sur la présentation et le contenu..."
								value={observations}
								onChange={(e) => setObservations(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							variant="ghost"
							onClick={onClose}
							className="flex-1 rounded-xl h-12"
						>
							Annuler
						</Button>
						<Button
							onClick={handleSave}
							className="flex-1 rounded-xl h-12 gap-2 shadow-lg shadow-primary/20"
						>
							<Save className="h-4 w-4" /> Enregistrer l'Évaluation
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Main Dashboard Component ---

export default function TeacherDashboard() {
	const [selectedStudent, setSelectedStudent] = useState<any>(null);
	const [isInfoOpen, setIsInfoOpen] = useState(false);
	const [isEvalOpen, setIsEvalOpen] = useState(false);
	const calendarRef = useRef<HTMLDivElement>(null);

	// Slot-based unavailability state
	const [unavailableSlots, setUnavailableSlots] = useState<
		Record<number, string[]>
	>({
		10: ["08:30 - 09:15", "09:20 - 10:05"],
		11: ["14:00 - 14:45"],
	});

	const teacherStats = [
		{
			title: "Soutenances (Jury)",
			value: "12",
			icon: Users,
			color: "text-primary",
			bg: "bg-primary/10",
		},
		{
			title: "Projets Encadrés",
			value: "05",
			icon: BookOpen,
			color: "text-primary",
			bg: "bg-primary/10",
		},
		{
			title: "Rapports Reçus",
			value: "08",
			icon: FileText,
			color: "text-primary",
			bg: "bg-primary/10",
		},
	];

	const upcomingDefenses = [
		{
			id: 1,
			student: "Mohamed Ali",
			cne: "D135678942",
			project: "Système Intelligente de Gestion des dépenses",
			date: "15 Juin 2026",
			day: 15,
			time: "09:30 AM",
			room: "TD-05",
			role: "Président",
			status: "Confirmé",
		},
		{
			id: 2,
			student: "Fatimah Zahra",
			cne: "G145223311",
			project: "Analyse des données massives avec Spark",
			date: "16 Juin 2026",
			day: 16,
			time: "11:00 AM",
			room: "TD-06",
			role: "Rapporteur",
			status: "En attente",
		},
		{
			id: 3,
			student: "Karim Idrissi",
			cne: "E122998877",
			project: "Sécurité des objets connectés (IoT)",
			date: "18 Juin 2026",
			day: 18,
			time: "14:30 PM",
			room: "Amphi-6",
			role: "Examinateur",
			status: "Confirmé",
		},
	];

	const handleAction = (type: string, defense: any) => {
		setSelectedStudent(defense);
		if (type === "info") setIsInfoOpen(true);
		if (type === "eval") setIsEvalOpen(true);
	};

	const scrollToCalendar = () => {
		calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">
						Espace Enseignant & Jury
					</h1>
					<p className="text-muted-foreground font-sans">
						Suivi des plannings, consultation des dossiers et saisie des
						évaluations.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button
						variant="default"
						onClick={scrollToCalendar}
						className="gap-2"
					>
						<TimerOff className="h-4 w-4 text-white" />
						Déclarer Indisponibilité
					</Button>
					<Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all bg-slate-900 text-white hover:bg-slate-800">
						<Download className="h-4 w-4" />
						Ma Convocation (PDF)
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{teacherStats.map((stat, i) => (
					<Card
						key={i}
						className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all"
					>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
										{stat.title}
									</p>
									<p className="text-3xl font-bold font-heading">
										{stat.value}
									</p>
								</div>
								<div
									className={`p-3 rounded-full ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
								>
									<stat.icon className="h-6 w-6 text-primary" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Main Content with Tabs */}
			<Tabs defaultValue="jury" className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<TabsList className="bg-muted/50 p-1 rounded-xl">
						<TabsTrigger
							value="jury"
							className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
						>
							<Users className="h-4 w-4" /> Planning des Soutenances
						</TabsTrigger>
						<TabsTrigger
							value="supervision"
							className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
						>
							<BookOpen className="h-4 w-4" /> Mes Encadrements
						</TabsTrigger>
					</TabsList>

					<div className="relative w-full sm:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher une session..."
							className="pl-10 bg-white border-primary/10 rounded-xl"
						/>
					</div>
				</div>

				<TabsContent value="jury" className="space-y-6">
					<Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden rounded-3xl">
						<CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div>
									<CardTitle className="text-2xl font-heading">
										Mon Planning de Jury
									</CardTitle>
									<CardDescription className="font-sans">
										Liste exhaustive des sessions de soutenance auxquelles vous
										êtes convoqué.
									</CardDescription>
								</div>
								<Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full">
									Session Printemps 2026
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-slate-50/30">
									<TableRow className="hover:bg-transparent border-slate-100">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Étudiant
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Sujet du Projet
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Planification
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Lieu
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Rôle Jury
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{upcomingDefenses.map((defense) => (
										<TableRow
											key={defense.id}
											className="hover:bg-primary/2 transition-colors border-slate-50 group"
										>
											<TableCell className="p-6">
												<div className="flex items-center gap-4">
													<div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary text-xs font-bold group-hover:scale-110 transition-transform">
														{defense.student
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</div>
													<div className="flex flex-col">
														<span className="font-bold text-slate-700">
															{defense.student}
														</span>
														<span className="text-[10px] text-muted-foreground font-mono">
															{defense.cne}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell className="p-6 max-w-[250px]">
												<p className="text-sm italic text-muted-foreground line-clamp-2 leading-relaxed">
													"{defense.project}"
												</p>
											</TableCell>
											<TableCell className="p-6">
												<div className="flex flex-col">
													<span className="font-bold text-sm text-slate-700">
														{defense.date}
													</span>
													<span className="text-xs text-muted-foreground flex items-center gap-1.5">
														<Clock className="h-3 w-3" /> {defense.time}
													</span>
												</div>
											</TableCell>
											<TableCell className="p-6">
												<div className="flex items-center gap-2 text-sm font-medium">
													<MapPin className="h-4 w-4 text-primary" />
													<span>{defense.room}</span>
												</div>
											</TableCell>
											<TableCell className="p-6">
												<Badge
													className={
														defense.role === "Président"
															? "bg-blue-100 text-blue-700 border-none px-4"
															: "bg-slate-100 text-slate-700 border-none px-4"
													}
												>
													{defense.role}
												</Badge>
											</TableCell>
											<TableCell className="p-6 text-right">
												<div className="flex justify-end gap-2">
													<Button
														variant="outline"
														size="icon"
														className="h-10 w-10 rounded-xl border-slate-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
														title="Informations Étudiant"
														onClick={() => handleAction("info", defense)}
													>
														<User className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														className="h-10 w-10 rounded-xl border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
														title="Saisir Notes & Observations"
														onClick={() => handleAction("eval", defense)}
													>
														<ClipboardCheck className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														className="h-10 w-10 rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
														title="Générer Fiche d'Évaluation"
													>
														<FileText className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="supervision">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<Card
								key={i}
								className="group hover:shadow-xl transition-all border-primary/5 relative overflow-hidden rounded-3xl"
							>
								<div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
								<CardHeader className="pb-4">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-4">
											<div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
												{i === 1 ? "MA" : i === 2 ? "FZ" : "KI"}
											</div>
											<div>
												<CardTitle className="text-lg font-heading font-bold">
													{i === 1
														? "Mohamed Ali"
														: i === 2
															? "Fatimah Zahra"
															: "Karim Idrissi"}
												</CardTitle>
												<CardDescription className="text-[10px] uppercase font-bold tracking-tighter">
													Master Qualité Logicielle
												</CardDescription>
											</div>
										</div>
										<Badge className="bg-emerald-50 text-emerald-700 border-none">
											En cours
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="p-4 bg-slate-50 rounded-2xl text-xs italic border-l-2 border-primary/30 group-hover:bg-white transition-colors">
										"Développement d'une application mobile de suivi en temps
										réel des performances..."
									</div>
									<div className="space-y-2">
										<div className="flex justify-between items-center text-xs">
											<span className="text-muted-foreground font-medium">
												Progression du rapport
											</span>
											<span className="font-bold text-primary">75%</span>
										</div>
										<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
											<div className="bg-primary h-full w-[75%] rounded-full shadow-sm" />
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3 pt-2">
										<Button
											size="sm"
											className="gap-2 bg-slate-900 hover:bg-slate-800 rounded-xl"
										>
											<FileText className="h-4 w-4" /> Lire Rapport
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="gap-2 border-slate-200 hover:bg-primary/5 rounded-xl"
										>
											<ExternalLink className="h-4 w-4" /> Dossier
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>

			{/* Reusable Availability Calendar Section */}
			<div ref={calendarRef} className="pt-10 scroll-mt-8">
				<AvailabilityCalendar
					monthName="Juin"
					year={2026}
					unavailableSlots={unavailableSlots}
					onToggleSlot={toggleSlot}
					sessions={upcomingDefenses}
					onSave={() =>
						alert("Planning de disponibilité mis à jour avec succès.")
					}
				/>
			</div>

			<StudentInfoDialog
				isOpen={isInfoOpen}
				onClose={() => setIsInfoOpen(false)}
				student={selectedStudent}
			/>

			<EvaluationDialog
				isOpen={isEvalOpen}
				onClose={() => setIsEvalOpen(false)}
				student={selectedStudent}
			/>
		</div>
	);
}
