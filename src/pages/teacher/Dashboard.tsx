import React from "react";
import {
	BookOpen,
	User,
	Calendar,
	MapPin,
	Search,
	Filter,
	ArrowRight,
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

const TeacherDashboard: React.FC = () => {
	const soutenances = [
		{
			id: 1,
			student: "Amine Rahmani",
			type: "PFE Master",
			date: "20 Juin 2025",
			time: "10:00",
			room: "S-12",
			role: "Rapporteur",
			status: "À venir",
		},
		{
			id: 2,
			student: "Sonia Belkaid",
			type: "PFE Licence",
			date: "18 Juin 2025",
			time: "14:00",
			room: "B-04",
			role: "Président",
			status: "À venir",
		},
		{
			id: 3,
			student: "Yacine Ziri",
			type: "PFE Master",
			date: "15 Juin 2025",
			time: "09:00",
			room: "B-204",
			role: "Examinateur",
			status: "Aujourd'hui",
		},
		{
			id: 4,
			student: "Meriem Haddad",
			type: "Doctorat",
			date: "10 Juin 2025",
			time: "09:00",
			room: "Amphi A",
			role: "Rapporteur",
			status: "Terminé",
		},
	];

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">Mes Soutenances</h1>
					<p className="text-muted-foreground">
						Consultez et gérez les soutenances où vous êtes membre du jury.
					</p>
				</div>
				<div className="flex gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher un étudiant..."
							className="pl-9 w-62.5"
						/>
					</div>
					<Button variant="outline" size="icon">
						<Filter className="h-4 w-4 text-primary" />
					</Button>
				</div>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{
						label: "Total Soutenances",
						value: "12",
						icon: BookOpen,
					},
					{
						label: "À évaluer",
						value: "3",
						icon: Calendar,
					},
					{
						label: "Rapporteur",
						value: "5",
						icon: User,
					},
					{
						label: "Terminées",
						value: "8",
						icon: ArrowRight,
					},
				].map((stat, i) => (
					<Card key={i}>
						<CardContent className="p-6 flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									{stat.label}
								</p>
								<p className="text-2xl font-bold mt-1">{stat.value}</p>
							</div>
							<div className="p-3 bg-primary/10 rounded-xl">
								<stat.icon className="h-6 w-6 text-primary" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="font-heading">Liste des Soutenances</CardTitle>
					<CardDescription>
						Vos prochaines interventions classées par date.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Étudiant</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Date & Heure</TableHead>
								<TableHead>Salle</TableHead>
								<TableHead>Mon Rôle</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{soutenances.map((s) => (
								<TableRow key={s.id}>
									<TableCell className="font-medium">{s.student}</TableCell>
									<TableCell>
										<Badge variant="outline" className="font-normal">
											{s.type}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="text-sm">{s.date}</span>
											<span className="text-xs text-muted-foreground">
												{s.time}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5 text-xs">
											<MapPin className="h-3 w-3 text-primary" />
											{s.room}
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm font-medium">{s.role}</span>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												s.status === "Terminé"
													? "secondary"
													: s.status === "Aujourd'hui"
														? "default"
														: "outline"
											}
											className={
												s.status === "Aujourd'hui"
													? "bg-amber-500 hover:bg-amber-600 border-none"
													: ""
											}
										>
											{s.status}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
											Détails
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default TeacherDashboard;
