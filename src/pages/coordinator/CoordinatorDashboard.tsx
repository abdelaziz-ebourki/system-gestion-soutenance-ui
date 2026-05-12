import { useState, useMemo } from "react";
import {
	AlertTriangle,
	Search,
	Calendar,
	MapPin,
	UserPlus,
	Check,
	FileText,
	BookOpen,
	MoreHorizontal,
	Plus,
	Edit,
	Trash2,
	User,
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Candidate } from "@/pages/teacher/types";

// --- Types ---
export interface JuryMember {
	name: string;
	role: "Président" | "Rapporteur" | "Examinateur";
}

export interface Project {
	id: number;
	title: string;
	filiere: string;
	supervisor: string;
	coSupervisor?: string;
	description?: string;
	status: "Disponible" | "Affecté";
}

export interface Defense {
	id: number;
	groupName: string;
	students: Candidate[];
	project: string;
	projectId: number;
	filiere: string;
	date: string;
	day: number;
	time: string;
	room: string;
	jury: JuryMember[];
	status: "Planifié" | "Validé" | "En Conflit" | "Publié";
}

export interface PlanningConflict {
	defenseId: number;
	type: "Professeur" | "Salle";
	message: string;
	involvedDefenses: number[];
}

// --- Mock Data ---
const INITIAL_PROJECTS: Project[] = [
	{
		id: 1,
		title: "Système Intelligente de Gestion des dépenses",
		filiere: "Génie Informatique",
		supervisor: "Pr. Ahmed Alami",
		status: "Affecté",
	},
	{
		id: 2,
		title: "Analyse des données massives avec Spark",
		filiere: "Big Data",
		supervisor: "Pr. Karim Idrissi",
		status: "Affecté",
	},
	{
		id: 3,
		title: "Sécurité des objets connectés (IoT)",
		filiere: "Cyber-Sécurité",
		supervisor: "Pr. Laila Mansouri",
		status: "Affecté",
	},
	{
		id: 4,
		title: "Application de Télé-médecine avec WebRTC",
		filiere: "Génie Informatique",
		supervisor: "Pr. Fatimah Benani",
		status: "Disponible",
	},
];

const INITIAL_DEFENSES: Defense[] = [
	{
		id: 1,
		groupName: "Groupe-1",
		projectId: 1,
		students: [
			{ name: "Amine El Fassi", cne: "D135678942" },
			{ name: "Salma Bennani", cne: "D135678943" },
		],
		project: "Système Intelligente de Gestion des dépenses",
		filiere: "Génie Informatique",
		date: "15 Juin 2026",
		day: 15,
		time: "08:30 - 10:00",
		room: "TD-05",
		jury: [
			{ name: "Pr. Ahmed Alami", role: "Président" },
			{ name: "Pr. Fatimah Benani", role: "Rapporteur" },
		],
		status: "Planifié",
	},
	{
		id: 2,
		groupName: "Groupe-2",
		projectId: 2,
		students: [{ name: "Youssef Mansouri", cne: "G145223311" }],
		project: "Analyse des données massives avec Spark",
		filiere: "Big Data",
		date: "15 Juin 2026",
		day: 15,
		time: "08:30 - 10:00",
		room: "TD-05",
		jury: [{ name: "Pr. Karim Idrissi", role: "Président" }],
		status: "Planifié",
	},
	{
		id: 3,
		groupName: "Groupe-3",
		projectId: 3,
		students: [
			{ name: "Kenza Idrissi", cne: "E122998877" },
			{ name: "Omar Benjelloun", cne: "E122998878" },
		],
		project: "Sécurité des objets connectés (IoT)",
		filiere: "Cyber-Sécurité",
		date: "16 Juin 2026",
		day: 16,
		time: "10:15 - 11:45",
		room: "Amphi C",
		jury: [
			{ name: "Pr. Ahmed Alami", role: "Président" },
			{ name: "Pr. Laila Mansouri", role: "Examinateur" },
		],
		status: "Planifié",
	},
];

const TEACHERS = [
	"Pr. Ahmed Alami",
	"Pr. Fatimah Benani",
	"Pr. Karim Idrissi",
	"Pr. Laila Mansouri",
	"Pr. Yassine El Amrani",
	"Pr. Sara Belhaj",
	"Pr. Mohamed Ali",
];

export default function CoordinatorDashboard() {
	const [defenses, setDefenses] = useState<Defense[]>(INITIAL_DEFENSES);
	const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDefense, setSelectedDefense] = useState<Defense | null>(null);
	const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
	
	const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
	const [editingProject, setEditingProject] = useState<Project | null>(null);

	// --- Conflict Detection Logic ---
	const conflicts = useMemo<PlanningConflict[]>(() => {
		const newConflicts: PlanningConflict[] = [];

		defenses.forEach((d1, i) => {
			defenses.slice(i + 1).forEach((d2) => {
				if (d1.date === d2.date && d1.time === d2.time) {
					if (d1.room === d2.room) {
						newConflicts.push({
							defenseId: d1.id,
							type: "Salle",
							message: `Conflit de salle (${d1.room}) avec ${d2.groupName}`,
							involvedDefenses: [d1.id, d2.id],
						});
						newConflicts.push({
							defenseId: d2.id,
							type: "Salle",
							message: `Conflit de salle (${d2.room}) avec ${d1.groupName}`,
							involvedDefenses: [d1.id, d2.id],
						});
					}

					const d1Teachers = d1.jury.map((j) => j.name);
					const d2Teachers = d2.jury.map((j) => j.name);
					const overlappingTeachers = d1Teachers.filter((t) =>
						d2Teachers.includes(t),
					);

					overlappingTeachers.forEach((t) => {
						newConflicts.push({
							defenseId: d1.id,
							type: "Professeur",
							message: `Conflit de professeur (${t}) avec ${d2.groupName}`,
							involvedDefenses: [d1.id, d2.id],
						});
						newConflicts.push({
							defenseId: d2.id,
							type: "Professeur",
							message: `Conflit de professeur (${t}) avec ${d1.groupName}`,
							involvedDefenses: [d1.id, d2.id],
						});
					});
				}
			});
		});

		return newConflicts;
	}, [defenses]);

	const getDefenseConflicts = (id: number) =>
		conflicts.filter((c) => c.defenseId === id);

	const handleAssignJury = (id: number, jury: JuryMember[]) => {
		setDefenses((prev) => prev.map((d) => (d.id === id ? { ...d, jury } : d)));
	};

	const handlePublishPlanning = () => {
		setDefenses((prev) => prev.map(d => ({ ...d, status: "Publié" })));
		alert("Planning publié avec succès !");
	};

	const handleSaveProject = (projectData: Partial<Project>) => {
		if (editingProject) {
			setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...projectData } as Project : p));
		} else {
			const newProject: Project = {
				id: Math.max(0, ...projects.map(p => p.id)) + 1,
				title: projectData.title || "",
				filiere: projectData.filiere || "",
				supervisor: projectData.supervisor || "",
				status: "Disponible",
				...projectData
			};
			setProjects(prev => [...prev, newProject]);
		}
		setIsProjectModalOpen(false);
		setEditingProject(null);
	};

	const handleDeleteProject = (id: number) => {
		setProjects(prev => prev.filter(p => p.id !== id));
	};

	const filteredDefenses = defenses.filter(
		(d) =>
			d.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
			d.students.some((s) =>
				s.name.toLowerCase().includes(searchQuery.toLowerCase()),
			),
	);

	const filteredProjects = projects.filter(
		(p) =>
			p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.filiere.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-heading font-bold text-foreground">
						Espace Coordination
					</h1>
					<p className="text-muted-foreground font-sans text-lg">
						Gestion complète du cycle des soutenances et des projets.
					</p>
				</div>
				<div className="flex gap-3">
					<Button 
						onClick={handlePublishPlanning}
						className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-emerald-600/20"
					>
						<Check className="h-4 w-4 mr-2" /> Publier le Planning
					</Button>
				</div>
			</div>

			{/* Tabs Management */}
			<Tabs defaultValue="planning" className="space-y-8">
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/30 p-2 rounded-3xl border border-border">
					<TabsList className="bg-transparent h-auto p-0 flex-wrap justify-start">
						<TabsTrigger
							value="planning"
							className="gap-2 rounded-2xl py-3 px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold transition-all"
						>
							<Calendar className="h-4 w-4" /> Planning & Jurys
						</TabsTrigger>
						<TabsTrigger
							value="projects"
							className="gap-2 rounded-2xl py-3 px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold transition-all"
						>
							<BookOpen className="h-4 w-4" /> Gérer Projets
						</TabsTrigger>
					</TabsList>

					<div className="relative w-full lg:w-96 px-2">
						<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-12 bg-card border-border rounded-2xl h-12 shadow-sm focus:ring-primary/20"
						/>
					</div>
				</div>

				<TabsContent value="planning" className="space-y-6">
					{/* Planning Module */}
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
						<CardHeader className="p-8 border-b border-border bg-muted/10">
							<div className="flex justify-between items-center">
								<div>
									<CardTitle className="text-2xl font-heading">
										Planification des Soutenances
									</CardTitle>
									<CardDescription>
										Détectez les conflits et assignez les membres du jury.
									</CardDescription>
								</div>
								<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold">
									Session Juin 2026
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/5">
									<TableRow className="border-border">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Candidats / Groupe
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Détails Planning
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											Composition Jury
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6">
											État & Conflits
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredDefenses.map((defense) => {
										const defenseConflicts = getDefenseConflicts(defense.id);
										return (
											<TableRow
												key={defense.id}
												className="border-border hover:bg-muted/5 transition-colors"
											>
												<TableCell className="p-6">
													<div className="space-y-1">
														<div className="font-bold text-lg text-foreground">
															{defense.groupName}
														</div>
														<div className="text-sm text-muted-foreground">
															{defense.students.map((s) => s.name).join(", ")}
														</div>
														<Badge
															variant="outline"
															className="text-[9px] uppercase tracking-tighter"
														>
															{defense.filiere}
														</Badge>
													</div>
												</TableCell>
												<TableCell className="p-6">
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-sm font-medium">
															<Calendar className="h-4 w-4 text-primary/60" />
															{defense.date}
														</div>
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<MapPin className="h-4 w-4 text-primary/60" />
															{defense.room} — {defense.time}
														</div>
													</div>
												</TableCell>
												<TableCell className="p-6">
													<div className="flex flex-col gap-1.5">
														{defense.jury.length > 0 ? (
															defense.jury.map((j, i) => (
																<div
																	key={i}
																	className="text-xs flex items-center gap-2"
																>
																	<span className="text-muted-foreground w-16 italic">
																		{j.role}:
																	</span>
																	<span className="font-semibold">
																		{j.name}
																	</span>
																</div>
															))
														) : (
															<span className="text-xs text-destructive italic">
																Jury non assigné
															</span>
														)}
													</div>
												</TableCell>
												<TableCell className="p-6">
													<div className="space-y-2">
														{defenseConflicts.length > 0 ? (
															<>
																<Badge className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">
																	<AlertTriangle className="h-3 w-3 mr-1" />{" "}
																	Conflit
																</Badge>
																{defenseConflicts.map((c, i) => (
																	<p
																		key={i}
																		className="text-[10px] text-destructive leading-tight font-medium max-w-[150px]"
																	>
																		⚠ {c.message}
																	</p>
																))}
															</>
														) : (
															<Badge className={
																defense.status === "Publié" 
																	? "bg-primary text-primary-foreground font-bold"
																	: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
															}>
																<Check className="h-3 w-3 mr-1" />{" "}
																{defense.status}
															</Badge>
														)}
													</div>
												</TableCell>
												<TableCell className="p-6 text-right">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="rounded-full"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															className="w-56 rounded-xl p-2"
														>
															<DropdownMenuLabel>
																Actions Coordinateur
															</DropdownMenuLabel>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() => {
																	setSelectedDefense(defense);
																	setIsJuryModalOpen(true);
																}}
																className="gap-2 rounded-lg cursor-pointer"
															>
																<UserPlus className="h-4 w-4" /> Modifier le
																Jury
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	alert("Génération de convocation...")
																}
																className="gap-2 rounded-lg cursor-pointer"
															>
																<FileText className="h-4 w-4" /> Générer
																Convocation
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem className="gap-2 rounded-lg text-destructive focus:text-destructive cursor-pointer">
																<AlertTriangle className="h-4 w-4" /> Signaler
																Anomalie
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="projects" className="space-y-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold font-heading">Catalogue des Projets</h2>
						<Button 
							onClick={() => {
								setEditingProject(null);
								setIsProjectModalOpen(true);
							}}
							className="rounded-xl font-bold bg-primary"
						>
							<Plus className="h-4 w-4 mr-2" /> Nouveau Projet
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProjects.map((p) => (
							<Card
								key={p.id}
								className="border-border hover:shadow-lg transition-all rounded-3xl overflow-hidden group"
							>
								<CardHeader className="bg-muted/10 group-hover:bg-primary/5 transition-colors">
									<div className="flex justify-between items-start mb-2">
										<Badge variant="secondary">{p.filiere}</Badge>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-full"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="rounded-xl">
												<DropdownMenuItem 
													onClick={() => {
														setEditingProject(p);
														setIsProjectModalOpen(true);
													}}
													className="gap-2 rounded-lg cursor-pointer"
												>
													<Edit className="h-4 w-4" /> Modifier
												</DropdownMenuItem>
												<DropdownMenuItem 
													onClick={() => handleDeleteProject(p.id)}
													className="gap-2 rounded-lg text-destructive focus:text-destructive cursor-pointer"
												>
													<Trash2 className="h-4 w-4" /> Supprimer
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
									<CardTitle className="text-xl line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-primary transition-colors">
										{p.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-6 space-y-4">
									<div className="space-y-2">
										<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
											Encadrant Principal
										</p>
										<div className="flex items-center gap-2">
											<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
												<User className="h-4 w-4 text-primary" />
											</div>
											<span className="font-semibold text-sm">{p.supervisor}</span>
										</div>
									</div>
									<div className="pt-4 border-t border-border flex justify-between items-center">
										<Badge className={p.status === "Affecté" ? "bg-emerald-500/10 text-emerald-700" : "bg-blue-500/10 text-blue-700"}>
											{p.status}
										</Badge>
										<Button
											size="sm"
											variant="ghost"
											className="text-primary font-bold"
										>
											Détails
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>

			{/* Jury Assignment Modal */}
			{isJuryModalOpen && selectedDefense && (
				<JuryModal
					defense={selectedDefense}
					onClose={() => setIsJuryModalOpen(false)}
					onSave={handleAssignJury}
				/>
			)}

			{/* Project Management Modal */}
			<ProjectModal 
				isOpen={isProjectModalOpen}
				onClose={() => setIsProjectModalOpen(false)}
				onSave={handleSaveProject}
				project={editingProject}
			/>
		</div>
	);
}

// --- Internal Components ---

function JuryModal({
	defense,
	onClose,
	onSave,
}: {
	defense: Defense;
	onClose: () => void;
	onSave: (id: number, jury: JuryMember[]) => void;
}) {
	const [jury, setJury] = useState<JuryMember[]>(defense.jury);

	const roles: JuryMember["role"][] = [
		"Président",
		"Rapporteur",
		"Examinateur",
	];

	const handleTeacherChange = (role: JuryMember["role"], name: string) => {
		setJury((prev) => {
			const filtered = prev.filter((j) => j.role !== role);
			if (name === "none") return filtered;
			return [...filtered, { role, name }];
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col">
				<div className="p-8 border-b border-border bg-muted/20">
					<h2 className="text-2xl font-heading font-bold">
						Assignation du Jury
					</h2>
					<p className="text-muted-foreground text-sm">
						{defense.groupName} — {defense.project}
					</p>
				</div>

				<div className="p-8 space-y-6">
					{roles.map((role) => (
						<div key={role} className="space-y-2">
							<label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
								{role}
							</label>
							<select
								className="w-full bg-background border border-border rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
								value={jury.find((j) => j.role === role)?.name || "none"}
								onChange={(e) => handleTeacherChange(role, e.target.value)}
							>
								<option value="none">Sélectionner un enseignant...</option>
								{TEACHERS.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</div>
					))}
				</div>

				<div className="p-6 bg-muted/20 border-t border-border flex justify-end gap-3">
					<Button variant="ghost" onClick={onClose} className="rounded-xl">
						Annuler
					</Button>
					<Button
						onClick={() => {
							onSave(defense.id, jury);
							onClose();
						}}
						className="rounded-xl bg-primary shadow-lg shadow-primary/20"
					>
						Enregistrer les modifications
					</Button>
				</div>
			</div>
		</div>
	);
}

function ProjectModal({
	isOpen,
	onClose,
	onSave,
	project
}: {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: Partial<Project>) => void;
	project: Project | null;
}) {
	const [formData, setFormData] = useState<Partial<Project>>(project || {
		title: "",
		filiere: "",
		supervisor: "",
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[500px] rounded-3xl">
					<DialogHeader>
						<DialogTitle>{project ? "Modifier le Projet" : "Nouveau Projet"}</DialogTitle>
						<DialogDescription>
							Remplissez les informations du projet et assignez un encadrant.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Titre du Projet</Label>
							<Input 
								id="title" 
								value={formData.title} 
								onChange={(e) => setFormData({...formData, title: e.target.value})}
								placeholder="Ex: Analyse des données massives..."
								className="rounded-xl"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="filiere">Filière</Label>
							<select
								id="filiere"
								className="w-full bg-background border border-border rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
								value={formData.filiere}
								onChange={(e) => setFormData({...formData, filiere: e.target.value})}
							>
								<option value="">Sélectionner une filière...</option>
								<option value="Génie Informatique">Génie Informatique</option>
								<option value="Big Data">Big Data</option>
								<option value="Cyber-Sécurité">Cyber-Sécurité</option>
							</select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="supervisor">Encadrant Principal</Label>
							<select
								id="supervisor"
								className="w-full bg-background border border-border rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
								value={formData.supervisor}
								onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
							>
								<option value="">Sélectionner un enseignant...</option>
								{TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
							</select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={onClose} className="rounded-xl">Annuler</Button>
						<Button onClick={() => onSave(formData)} className="rounded-xl bg-primary">Enregistrer</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
