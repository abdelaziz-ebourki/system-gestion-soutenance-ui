import React from "react";
import {
	Calendar,
	Clock,
	Users,
	BookOpen,
	CheckSquare,
	FileText,
	Search,
	MoreVertical,
	ExternalLink,
	UserCheck,
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

export default function TeacherDashboard() {
	const teacherStats = [
		{
			title: "Soutenances (Jury)",
			value: "12",
			icon: Users,
			color: "text-blue-600",
			bg: "bg-blue-50",
		},
		{
			title: "Projets Encadrés",
			value: "05",
			icon: BookOpen,
			color: "text-purple-600",
			bg: "bg-purple-50",
		},
		{
			title: "À Évaluer",
			value: "03",
			icon: CheckSquare,
			color: "text-amber-600",
			bg: "bg-amber-50",
		},
		{
			title: "Rapports Reçus",
			value: "08",
			icon: FileText,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
		},
	];

	const upcomingDefenses = [
		{
			id: 1,
			student: "Mohamed Ali",
			project: "Système Intelligente de Gestion des dépenses",
			date: "15 Juin 2026",
			time: "09:30 AM",
			room: "TD-05",
			role: "Président",
			status: "Confirmé",
		},
		{
			id: 2,
			student: "Fatimah Zahra",
			project: "Analyse des données massives avec Spark",
			date: "16 Juin 2026",
			time: "11:00 AM",
			room: "Salle B",
			role: "Rapporteur",
			status: "En attente",
		},
		{
			id: 3,
			student: "Karim Idrissi",
			project: "Sécurité des objets connectés (IoT)",
			date: "18 Juin 2026",
			time: "14:30 PM",
			room: "Amphi C",
			role: "Examinateur",
			status: "Confirmé",
		},
	];

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">
						Espace Enseignant & Jury
					</h1>
					<p className="text-muted-foreground font-sans">
						Gérez vos examens, consultez votre planning et évaluez vos étudiants.
					</p>
				</div>
				<div className="flex gap-3">
					<Button variant="outline" className="gap-2">
						<Calendar className="h-4 w-4" />
						Mon Calendrier
					</Button>
					<Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
						<UserCheck className="h-4 w-4" />
						Saisir des Notes
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{teacherStats.map((stat, i) => (
					<Card key={i} className="border-none shadow-sm overflow-hidden group">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
										{stat.title}
									</p>
									<p className="text-3xl font-bold font-heading">{stat.value}</p>
								</div>
								<div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
									<stat.icon className="h-6 w-6" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Main Content with Tabs */}
			<Tabs defaultValue="jury" className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<TabsList className="bg-muted/50 p-1">
						<TabsTrigger value="jury" className="gap-2">
							<Users className="h-4 w-4" />
							Planning Jury
						</TabsTrigger>
						<TabsTrigger value="supervision" className="gap-2">
							<BookOpen className="h-4 w-4" />
							Étudiants Encadrés
						</TabsTrigger>
					</TabsList>
					
					<div className="relative w-full sm:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Rechercher..." className="pl-10 bg-white" />
					</div>
				</div>

				<TabsContent value="jury" className="space-y-6">
					<Card className="border-primary/10 shadow-sm overflow-hidden">
						<CardHeader className="bg-slate-50/50 border-b">
							<CardTitle className="text-xl font-heading">Soutenances à venir</CardTitle>
							<CardDescription>
								Liste des sessions où vous intervenez en tant que membre du jury.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-slate-50/30">
									<TableRow>
										<TableHead className="w-[200px]">Étudiant</TableHead>
										<TableHead>Sujet du Projet</TableHead>
										<TableHead>Date & Heure</TableHead>
										<TableHead>Lieu</TableHead>
										<TableHead>Votre Rôle</TableHead>
										<TableHead>Statut</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{upcomingDefenses.map((defense) => (
										<TableRow key={defense.id} className="hover:bg-slate-50/50">
											<TableCell className="font-semibold">{defense.student}</TableCell>
											<TableCell className="max-w-[250px] truncate italic text-muted-foreground">
												"{defense.project}"
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">{defense.date}</span>
													<span className="text-xs text-muted-foreground flex items-center gap-1">
														<Clock className="h-3 w-3" /> {defense.time}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="bg-slate-50">
													{defense.room}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge className={
													defense.role === "Président" 
													? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none" 
													: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-none"
												}>
													{defense.role}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className={`h-2 w-2 rounded-full ${defense.status === "Confirmé" ? "bg-emerald-500" : "bg-amber-500"}`} />
													<span className="text-sm">{defense.status}</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button variant="ghost" size="icon" title="Voir le rapport">
														<FileText className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="icon" title="Plus d'options">
														<MoreVertical className="h-4 w-4" />
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
					<div className="grid md:grid-cols-2 gap-6">
						{[1, 2].map((i) => (
							<Card key={i} className="hover:shadow-md transition-shadow">
								<CardHeader className="pb-4">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-4">
											<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
												ST
											</div>
											<div>
												<CardTitle className="text-lg">Étudiant {i}</CardTitle>
												<CardDescription>Master Qualité Logicielle</CardDescription>
											</div>
										</div>
										<Badge>En cours</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="p-3 bg-slate-50 rounded-lg text-sm italic border-l-4 border-primary/30">
										"Développement d'une application mobile de suivi en temps réel..."
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground text-xs uppercase font-bold">Dernier dépôt</span>
										<span className="font-medium">Il y a 2 jours</span>
									</div>
									<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
										<div className="bg-primary h-full w-[75%]" />
									</div>
									<div className="flex gap-2">
										<Button size="sm" className="w-full gap-2">
											<FileText className="h-3 w-3" /> Lire Rapport
										</Button>
										<Button size="sm" variant="outline" className="w-full gap-2">
											<ExternalLink className="h-3 w-3" /> Profil
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
