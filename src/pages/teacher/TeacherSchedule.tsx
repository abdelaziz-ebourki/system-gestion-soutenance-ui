import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, MapPin, ShieldCheck, Timer } from "lucide-react";

import { getTeacherSchedule } from "@/lib/api";
import type { TeacherDefense } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

const roleLabel: Record<TeacherDefense["role"], string> = {
	president: "President",
	reporter: "Rapporteur",
	examiner: "Examinateur",
	supervisor: "Encadrant",
};

const statusLabel: Record<TeacherDefense["status"], string> = {
	scheduled: "Planifiee",
	completed: "Terminee",
};

export default function TeacherSchedule() {
	const [schedule, setSchedule] = React.useState<TeacherDefense[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				setSchedule(await getTeacherSchedule());
			} catch {
				toast.error("Erreur lors du chargement du planning");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const columns: ColumnDef<TeacherDefense>[] = [
		{
			accessorKey: "projectTitle",
			header: "Projet",
			cell: ({ row }) => (
				<div className="space-y-1">
					<div className="font-medium">{row.original.projectTitle}</div>
					<div className="text-xs text-muted-foreground">
						{row.original.studentNames.join(", ")}
					</div>
				</div>
			),
		},
		{
			accessorKey: "date",
			header: "Date",
		},
		{
			id: "slot",
			header: "Horaire",
			cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
		},
		{
			accessorKey: "roomName",
			header: "Salle",
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => <Badge variant="outline">{roleLabel[row.original.role]}</Badge>,
		},
		{
			accessorKey: "status",
			header: "Statut",
			cell: ({ row }) => (
				<Badge className="bg-secondary text-secondary-foreground">
					{statusLabel[row.original.status]}
				</Badge>
			),
		},
	];

	const upcomingCount = schedule.filter(
		(defense) => defense.status === "scheduled",
	).length;
	const supervisorCount = schedule.filter(
		(defense) => defense.role === "supervisor",
	).length;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Mon planning</h1>
				<p className="text-muted-foreground">
					Voici le planning des soutenances auxquelles vous participez.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Soutenances a venir</p>
							<p className="mt-2 text-3xl font-semibold">{upcomingCount}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<CalendarDays className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Roles de jury</p>
							<p className="mt-2 text-3xl font-semibold">
								{schedule.length - supervisorCount}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<ShieldCheck className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Encadrements</p>
							<p className="mt-2 text-3xl font-semibold">{supervisorCount}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<Timer className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle>Planning detaille</CardTitle>
					<CardDescription>
						Chaque passage indique votre role, la salle et le groupe d'etudiants.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="py-10 text-center text-sm text-muted-foreground">
							Chargement du planning...
						</div>
					) : (
						<DataTable
							columns={columns}
							data={schedule}
							filterColumn="projectTitle"
							filterPlaceholder="Rechercher un projet..."
						/>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2">
				{schedule
					.filter((defense) => defense.status === "scheduled")
					.map((defense) => (
						<Card key={defense.id} className="border-0 shadow-sm">
							<CardContent className="flex items-start justify-between gap-4 p-5">
								<div>
									<p className="font-medium">{defense.projectTitle}</p>
									<p className="mt-1 text-sm text-muted-foreground">
										{defense.studentNames.join(", ")}
									</p>
									<div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
										<span>{defense.date}</span>
										<span>{defense.startTime} - {defense.endTime}</span>
										<span className="inline-flex items-center gap-1">
											<MapPin className="size-3.5" />
											{defense.roomName}
										</span>
									</div>
								</div>
								<Badge className="bg-secondary text-secondary-foreground">
									{roleLabel[defense.role]}
								</Badge>
							</CardContent>
						</Card>
					))}
			</div>
		</div>
	);
}
