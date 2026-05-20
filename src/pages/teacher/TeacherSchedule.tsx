import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, MapPin, ShieldCheck, Timer } from "lucide-react";

import { useTeacherSchedule } from "@/hooks/use-queries";
import type { TeacherDefense } from "@/types";
import { DEFENSE_ROLE_LABELS } from "@/lib/constants";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { DataTable } from "@/components/ui/data-table";

const statusLabel: Record<TeacherDefense["status"], string> = {
  scheduled: "Planifiée",
  completed: "Terminée",
};

export default function TeacherSchedule() {
  const scheduleQuery = useTeacherSchedule();
  const schedule = scheduleQuery.data ?? [];
  const isLoading = scheduleQuery.isLoading;

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
      header: "Rôle",
      cell: ({ row }) => (
        <Badge variant="outline">{DEFENSE_ROLE_LABELS[row.original.role]}</Badge>
      ),
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

  const scheduled = useMemo(
    () => schedule.filter(
      (defense) => defense.status === "scheduled",
    ), [schedule]);
  const upcomingCount = scheduled.length;
  const supervisorCount = useMemo(() => schedule.filter(
    (defense) => defense.role === "supervisor",
  ).length, [schedule]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon planning</h1>
        <p className="text-muted-foreground">
          Voici le planning des soutenances auxquelles vous participez.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card >
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Soutenances à venir
              </p>
              <p className="mt-2 text-3xl font-semibold">{upcomingCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <CalendarDays className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card >
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Rôles de jury</p>
              <p className="mt-2 text-3xl font-semibold">
                {schedule.length - supervisorCount}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card >
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Encadrements</p>
              <p className="mt-2 text-3xl font-semibold">{supervisorCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <Timer className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card >
        <CardHeader>
          <CardTitle>Planning détaillé</CardTitle>
          <CardDescription>
            Chaque passage indique votre rôle, la salle et le groupe
            d'étudiants.
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

      {scheduled.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {scheduled.map((defense) => (
            <Card key={defense.id} >
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{defense.projectTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {defense.studentNames.join(", ")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{defense.date}</span>
                    <span>
                      {defense.startTime} - {defense.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {defense.roomName}
                    </span>
                  </div>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">
                  {DEFENSE_ROLE_LABELS[defense.role]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Aucune soutenance programmée pour la période sélectionnée.
        </div>
      )}
    </div>
  );
}
