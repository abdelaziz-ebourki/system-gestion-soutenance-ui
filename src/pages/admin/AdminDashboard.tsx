"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
	Users,
	GraduationCap,
	Building2,
	DoorOpen,
	CalendarCheck,
	History,
	Loader2,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";

import { getAdminStats, getUsers, getAuditLogs } from "@/lib/api";
import type { DashboardStats, User } from "@/types";
import { type AuditLog } from "@/types/audit-log";
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
	const [logs, setLogs] = React.useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				const [statsData, usersData, logsData] = await Promise.all([
					getAdminStats(),
					getUsers({ limit: 5 }),
					getAuditLogs(),
				]);
				setStats(statsData);
				setUsers(usersData.items);
				setLogs(logsData);
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
			cell: ({ row }) => (
				<Badge variant="outline" className="capitalize">
					{row.getValue("role")}
				</Badge>
			),
		},
	];

	const logColumns: ColumnDef<AuditLog>[] = [
		{
			accessorKey: "timestamp",
			header: "Date",
			cell: ({ row }) => format(new Date(row.original.timestamp), "dd/MM/yyyy HH:mm"),
		},
		{
			accessorKey: "adminEmail",
			header: "Admin",
		},
		{
			accessorKey: "action",
			header: "Action",
			cell: ({ row }) => (
				<Badge variant="outline" className="font-mono">{row.original.action}</Badge>
			),
		},
		{
			accessorKey: "details",
			header: "Détails",
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
				<Skeleton className="h-[400px] w-full" />
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
		total: { label: "Total", color: "var(--primary)" },
	} satisfies ChartConfig;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
				<p className="text-muted-foreground">Aperçu global de l'activité du système.</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Étudiants</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalStudents}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Enseignants</CardTitle>
						<GraduationCap className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalTeachers}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Départements</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalDepartments}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Salles</CardTitle>
						<DoorOpen className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalRooms}</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Distribution des Ressources</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
							<BarChart data={chartData}>
								<CartesianGrid vertical={false} />
								<XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="total" fill="var(--color-total)" radius={8} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Activités Système</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center">
								<div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
									<CalendarCheck className="h-5 w-5 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">{stats?.activeSessions} Sessions Actives</p>
								</div>
							</div>
							<div className="flex items-center">
								<div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
									<History className="h-5 w-5 text-primary" />
								</div>
								<div className="ml-4">
									<p className="text-sm font-medium">{stats?.upcomingDefenses} Soutenances</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Derniers Utilisateurs</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={userColumns} data={users} />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Audit Log</CardTitle>
					</CardHeader>
					<CardContent>
						<DataTable columns={logColumns} data={logs} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
