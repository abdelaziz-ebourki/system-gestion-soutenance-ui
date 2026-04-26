import React from "react";
import {
	Users,
	DoorOpen,
	Building2,
	Plus,
	Settings,
	MoreVertical,
	GraduationCap,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const AdminDashboard: React.FC = () => {
	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-heading font-bold">
						Gestion du Système
					</h1>
					<p className="text-muted-foreground">
						Administration des utilisateurs, des salles et des sessions
						académiques.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="gap-2">
						<Settings className="h-4 w-4" />
						Configuration
					</Button>
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						Nouvelle session
					</Button>
				</div>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{
						label: "Utilisateurs",
						value: "1,240",
						icon: Users,
					},
					{
						label: "Salles",
						value: "24",
						icon: DoorOpen,
					},
					{
						label: "Filières",
						value: "12",
						icon: GraduationCap,
					},
				].map((stat, i) => (
					<Card key={i}>
						<CardContent className="p-6 flex items-center gap-4">
							<div className="p-3 bg-primary/10 rounded-xl">
								<stat.icon className="h-6 w-6 text-primary" />
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									{stat.label}
								</p>
								<p className="text-2xl font-bold">{stat.value}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="font-heading">
								Gestion des Utilisateurs
							</CardTitle>
							<CardDescription>
								Administrer les comptes étudiants, enseignants et coordinateurs.
							</CardDescription>
						</div>
						<Button variant="ghost" size="sm">
							Gérer tout
						</Button>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Utilisateur</TableHead>
									<TableHead>Rôle</TableHead>
									<TableHead>Statut</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[
									{
										name: "Sofiane Melik",
										role: "STUDENT",
										status: "Actif",
									},
									{
										name: "Pr. Karima Haddad",
										role: "TEACHER",
										status: "Actif",
									},
									{
										name: "Zahra Ben",
										role: "COORDINATOR",
										status: "Actif",
									},
									{
										name: "Admin Root",
										role: "ADMIN",
										status: "Actif",
									},
								].map((user, i) => (
									<TableRow key={i}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>
											<Badge variant="outline" className="text-[10px]">
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1.5">
												<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
												<span className="text-xs">{user.status}</span>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreVertical className="h-3 w-3" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="font-heading">Gestion des Salles</CardTitle>
							<CardDescription>
								Configuration des amphis, salles de TD et TP.
							</CardDescription>
						</div>
						<Button variant="ghost" size="sm">
							Gérer
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[
								{
									room: "Amphi 1",
									type: "Amphithéâtre",
									capacity: 200,
									status: "Disponible",
								},
								{
									room: "TD-6",
									type: "Salle de TD",
									capacity: 40,
									status: "Disponible",
								},
								{
									room: "TD-5",
									type: "Salle de TD",
									capacity: 40,
									status: "En cours",
								},
								{
									room: "Amphi B",
									type: "Amphithéâtre",
									capacity: 150,
									status: "Maintenance",
								},
							].map((room, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div className="flex items-center gap-3">
										<div className="p-2 bg-primary/10 rounded-md">
											<Building2 className="h-4 w-4 text-primary" />
										</div>
										<div>
											<p className="font-medium text-sm">{room.room}</p>
											<p className="text-[10px] text-muted-foreground">
												{room.type} • Capacité: {room.capacity}
											</p>
										</div>
									</div>
									<Badge
										variant={
											room.status === "Disponible"
												? "outline"
												: room.status === "En cours"
													? "default"
													: "destructive"
										}
										className="text-[10px]"
									>
										{room.status}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AdminDashboard;
