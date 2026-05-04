import { useState, useMemo } from "react";
import {
	Users,
	DoorOpen,
	CalendarDays,
	UserPlus,
	Plus,
	Search,
	MoreVertical,
	Trash2,
	Edit,
	CheckCircle2,
	XCircle,
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
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { User, Room, GlobalSession, AdminStatMetric } from "./types";
import { StatCard } from "@/components/teacher/StatCard";

export default function AdminDashboard() {
	// Mock Data for demonstration
	const stats = useMemo<AdminStatMetric[]>(
		() => [
			{
				title: "Utilisateurs",
				value: "124",
				icon: Users,
				bg: "bg-blue-500/10",
			},
			{
				title: "Salles Disponibles",
				value: "12",
				icon: DoorOpen,
				bg: "bg-green-500/10",
			},
			{
				title: "Sessions Globales",
				value: "03",
				icon: CalendarDays,
				bg: "bg-purple-500/10",
			},
		],
		[],
	);

	const users = useMemo<User[]>(
		() => [
			{
				id: 1,
				nom: "Zaitouni",
				prenom: "Nourelislam",
				email: "nourelislam@univ.ma",
				role: "ADMIN",
				actif: true,
			},
			{
				id: 2,
				nom: "Taoudi",
				prenom: "Abdelaziz",
				email: "abdelaziz@univ.ma",
				role: "COORDINATOR",
				actif: true,
			},
			{
				id: 3,
				nom: "Ait Daoud",
				prenom: "Mohammed",
				email: "m.aitdaoud@univ.ma",
				role: "TEACHER",
				actif: true,
			},
			{
				id: 4,
				nom: "Benani",
				prenom: "Amine",
				email: "amine.benani@student.ma",
				role: "STUDENT",
				actif: false,
			},
		],
		[],
	);

	const rooms = useMemo<Room[]>(
		() => [
			{
				id: 1,
				nom: "Amphi A",
				batiment: "Bloc A",
				capacite: 200,
				disponible: true,
			},
			{
				id: 2,
				nom: "Salle TD 1",
				batiment: "Bloc B",
				capacite: 40,
				disponible: true,
			},
			{
				id: 3,
				nom: "Labo Info",
				batiment: "Bloc C",
				capacite: 30,
				disponible: false,
			},
		],
		[],
	);

	const sessions = useMemo<GlobalSession[]>(
		() => [
			{
				id: 1,
				libelle: "Session Printemps 2026",
				dateDebut: "2026-06-01",
				dateFin: "2026-06-30",
				statut: "OUVERTE",
			},
			{
				id: 2,
				libelle: "Session Rattrapage 2026",
				dateDebut: "2026-07-15",
				dateFin: "2026-07-25",
				statut: "CLOTUREE",
			},
		],
		[],
	);

	return (
		<div className="space-y-12 animate-in fade-in duration-500 pb-20">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-heading font-bold text-foreground">
						Tableau de Bord Administrateur
					</h1>
					<p className="text-muted-foreground font-sans text-lg">
						Gestion centralisée des comptes, des ressources logistiques et des
						paramètres système.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<Button className="gap-2 shadow-lg hover:shadow-primary/20 transition-all bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 font-bold">
						<UserPlus className="h-4 w-4" /> Nouvel Utilisateur
					</Button>
					<Button
						variant="outline"
						className="gap-2 rounded-xl h-11 border border-border shadow-sm font-bold bg-card"
					>
						<Download className="h-4 w-4" /> Rapport Global
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{stats.map((stat, i) => (
					<StatCard key={i} metric={stat} />
				))}
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="users" className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-muted/20 rounded-3xl border border-border/50">
					<TabsList className="bg-muted/50 rounded-2xl border border-border p-1">
						<TabsTrigger
							value="users"
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 py-2.5 transition-all"
						>
							<Users className="h-4 w-4" /> Utilisateurs
						</TabsTrigger>
						<TabsTrigger
							value="rooms"
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 py-2.5 transition-all"
						>
							<DoorOpen className="h-4 w-4" /> Salles
						</TabsTrigger>
						<TabsTrigger
							value="sessions"
							className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-bold px-6 py-2.5 transition-all"
						>
							<CalendarDays className="h-4 w-4" /> Sessions
						</TabsTrigger>
					</TabsList>

					<div className="relative w-full sm:w-80">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher une entrée..."
							className="pl-12 bg-card border-border rounded-xl h-11 shadow-sm focus:ring-primary/20"
						/>
					</div>
				</div>

				{/* Users Management */}
				<TabsContent value="users" className="space-y-6">
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
						<CardHeader className="bg-muted/20 border-b border-border p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div>
									<CardTitle className="text-2xl font-heading text-foreground font-bold">
										Gestion des Comptes
									</CardTitle>
									<CardDescription className="font-sans text-muted-foreground">
										Consultez et modifiez les accès des différents acteurs du
										système.
									</CardDescription>
								</div>
								<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest">
									{users.length} Total
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/10">
									<TableRow className="hover:bg-transparent border-border">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Utilisateur
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Rôle
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											État du Compte
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow
											key={user.id}
											className="hover:bg-muted/5 border-border transition-colors group"
										>
											<TableCell className="p-6">
												<div className="flex flex-col">
													<span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
														{user.nom} {user.prenom}
													</span>
													<span className="text-sm text-muted-foreground">
														{user.email}
													</span>
												</div>
											</TableCell>
											<TableCell className="p-6">
												<Badge
													variant="secondary"
													className="font-bold rounded-lg px-3 py-1 bg-muted/50 border-border/50 text-[11px]"
												>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell className="p-6">
												{user.actif ? (
													<div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
														<CheckCircle2 className="h-3.5 w-3.5" />
														Actif
													</div>
												) : (
													<div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-500/10 w-fit px-3 py-1 rounded-full border border-red-500/20">
														<XCircle className="h-3.5 w-3.5" />
														Inactif
													</div>
												)}
											</TableCell>
											<TableCell className="p-6 text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
														>
															<MoreVertical className="h-5 w-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="rounded-2xl border-border shadow-2xl p-2 w-48"
													>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary">
															<Edit className="h-4 w-4" />
															<span className="font-bold">Modifier</span>
														</DropdownMenuItem>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
															<Trash2 className="h-4 w-4" />
															<span className="font-bold">Supprimer</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Rooms Management */}
				<TabsContent value="rooms" className="space-y-6">
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
						<CardHeader className="bg-muted/20 border-b border-border p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div>
									<CardTitle className="text-2xl font-heading text-foreground font-bold">
										Catalogue des Salles
									</CardTitle>
									<CardDescription className="font-sans text-muted-foreground">
										Gérez les espaces de soutenance et leur disponibilité.
									</CardDescription>
								</div>
								<Button className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold rounded-full px-5">
									<Plus className="h-4 w-4 mr-2" /> Ajouter une salle
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/10">
									<TableRow className="hover:bg-transparent border-border">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Nom de la Salle
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Bâtiment
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Capacité
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Statut
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rooms.map((room) => (
										<TableRow
											key={room.id}
											className="hover:bg-muted/5 border-border transition-colors group"
										>
											<TableCell className="p-6 font-bold text-foreground text-base group-hover:text-primary transition-colors">
												{room.nom}
											</TableCell>
											<TableCell className="p-6 font-medium">
												{room.batiment}
											</TableCell>
											<TableCell className="p-6">
												<div className="flex items-center gap-2">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span className="font-bold">{room.capacite} places</span>
												</div>
											</TableCell>
											<TableCell className="p-6">
												{room.disponible ? (
													<Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold px-3 py-1 rounded-full">
														Disponible
													</Badge>
												) : (
													<Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold px-3 py-1 rounded-full">
														Occupée
													</Badge>
												)}
											</TableCell>
											<TableCell className="p-6 text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
														>
															<MoreVertical className="h-5 w-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="rounded-2xl border-border shadow-2xl p-2 w-48"
													>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary">
															<Edit className="h-4 w-4" />
															<span className="font-bold">Modifier</span>
														</DropdownMenuItem>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
															<Trash2 className="h-4 w-4" />
															<span className="font-bold">Supprimer</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Sessions Management */}
				<TabsContent value="sessions" className="space-y-6">
					<Card className="border border-border shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-4xl">
						<CardHeader className="bg-muted/20 border-b border-border p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
								<div>
									<CardTitle className="text-2xl font-heading text-foreground font-bold">
										Sessions Globales
									</CardTitle>
									<CardDescription className="font-sans text-muted-foreground">
										Configurez les périodes de soutenance et leur état.
									</CardDescription>
								</div>
								<Button className="bg-primary shadow-lg hover:shadow-primary/20 transition-all font-bold rounded-xl h-10">
									<Plus className="h-4 w-4 mr-2" /> Créer une session
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader className="bg-muted/10">
									<TableRow className="hover:bg-transparent border-border">
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Libellé de la Session
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Période
										</TableHead>
										<TableHead className="font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Statut
										</TableHead>
										<TableHead className="text-right font-bold uppercase text-[10px] tracking-widest p-6 text-muted-foreground">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sessions.map((session) => (
										<TableRow
											key={session.id}
											className="hover:bg-muted/5 border-border transition-colors group"
										>
											<TableCell className="p-6 font-bold text-foreground text-base group-hover:text-primary transition-colors">
												{session.libelle}
											</TableCell>
											<TableCell className="p-6">
												<div className="flex items-center gap-2 text-sm font-medium">
													<CalendarDays className="h-4 w-4 text-primary/60" />
													<span>
														Du {session.dateDebut} au {session.dateFin}
													</span>
												</div>
											</TableCell>
											<TableCell className="p-6">
												<Badge
													variant={
														session.statut === "OUVERTE"
															? "default"
															: "secondary"
													}
													className={`font-bold px-4 py-1 rounded-full text-[10px] tracking-wider ${
														session.statut === "OUVERTE"
															? "bg-primary text-primary-foreground"
															: "bg-muted text-muted-foreground"
													}`}
												>
													{session.statut}
												</Badge>
											</TableCell>
											<TableCell className="p-6 text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
														>
															<MoreVertical className="h-5 w-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="rounded-2xl border-border shadow-2xl p-2 w-48"
													>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 focus:bg-primary/10 focus:text-primary">
															<Edit className="h-4 w-4" />
															<span className="font-bold">Gérer</span>
														</DropdownMenuItem>
														<DropdownMenuItem className="gap-3 rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
															<Trash2 className="h-4 w-4" />
															<span className="font-bold">Supprimer</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

