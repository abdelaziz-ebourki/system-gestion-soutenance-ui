"use client";

import * as React from "react";
import {
	Users,
	GraduationCap,
	Building2,
	DoorOpen,
	CalendarCheck,
	History,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { getAdminStats, getUsers } from "@/lib/api";
import type { DashboardStats, User } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminDashboard() {
	const [stats, setStats] = React.useState<DashboardStats | null>(null);
	const [users, setUsers] = React.useState<User[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsData, usersData] = await Promise.all([
					getAdminStats(),
					getUsers({ limit: 5 }),
				]);
				setStats(statsData);
				setUsers(usersData.items);
			} catch {
				toast.error("Erreur lors du chargement des données");
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const userColumns: ColumnDef<User>[] = [
		{
			id: "full_name",
			header: "Utilisateur",
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.lastName} {row.original.firstName}
				</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "role",
			header: "Rôle",
			cell: ({ row }) => {
				const role = row.getValue("role") as string;
				return (
					<Badge variant="outline" className="capitalize">
						{role}
					</Badge>
				);
			},
		},
		{
			accessorKey: "isActive",
			header: "Statut",
			cell: ({ row }) => (
				<Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
					{row.getValue("isActive") ? "Actif" : "Inactif"}
				</Badge>
			),
		},
	];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
					<p className="text-muted-foreground">Chargement des données...</p>
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32 w-full" />
					))}
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<Skeleton className="col-span-4 h-[400px]" />
					<Skeleton className="col-span-3 h-[400px]" />
				</div>
			</div>
		);
	}

	const chartData = [
		{ name: "Étudiants", total: stats?.totalStudents || 0 },
		{ name: "Enseignants", total: stats?.totalTeachers || 0 },
		{ name: "Départements", total: stats?.totalDepartments || 0 },
		{ name: "Salles", total: stats?.totalRooms || 0 },
	];

	const chartConfig = {
		total: {
			label: "Total",
			color: "var(--primary)",
		},
	} satisfies ChartConfig;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
				<p className="text-muted-foreground">
					Aperçu global de l'activité du système.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Étudiants</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalStudents}</div>
						<p className="text-xs text-muted-foreground">Inscrits cette année</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Enseignants</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalTeachers}</div>
						<p className="text-xs text-muted-foreground">Corps professoral</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Départements</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalDepartments}</div>
						<p className="text-xs text-muted-foreground">Unités académiques</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Salles</CardTitle>
						<DoorOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalRooms}</div>
						<p className="text-xs text-muted-foreground">Disponibles</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Distribution des Ressources</CardTitle>
						<CardDescription>
							Comparaison entre les différentes entités gérées.
						</CardDescription>
					</CardHeader>
					<CardContent className="pl-2">
						<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
							<BarChart data={chartData}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="name"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
								/>
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="total" fill="var(--color-total)" radius={8} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Activités Récentes</CardTitle>
						<CardDescription>
							Résumé des opérations en cours.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-8">
							<div className="flex items-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<CalendarCheck className="h-6 w-6" />
								</div>
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">
										{stats?.activeSessions} Sessions Actives
									</p>
									<p className="text-sm text-muted-foreground">
										En cours de planification
									</p>
								</div>
							</div>
							<div className="flex items-center">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<History className="h-6 w-6" />
								</div>
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">
										{stats?.upcomingDefenses} Soutenances à venir
									</p>
									<p className="text-sm text-muted-foreground">
										Prévues pour les 30 prochains jours
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Derniers Utilisateurs</CardTitle>
					<CardDescription>
						Liste des membres inscrits récemment sur la plateforme.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable
						columns={userColumns}
						data={users}
						filterColumn="full_name"
						filterPlaceholder="Filtrer par nom..."
					/>
				</CardContent>
			</Card>
		</div>
	);
}
