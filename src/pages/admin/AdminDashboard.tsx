import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import {
  Users,
  GraduationCap,
  Building2,
  DoorOpen,
  CalendarCheck,
  History,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format } from "date-fns";

import { useAdminStats, useUsers, useAuditLogs, useUpdateUser, useDeleteUser } from "@/hooks/queries";
import { DEFAULT_API_LIMIT, MAX_TEACHER_FETCH_LIMIT } from "@/lib/constants";
import type { User } from "@/types";
import type { AuditLog } from "@/types/audit-log";
import { DataTable } from "@/components/ui/data-table";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  StatsCard,
} from "@/components/ui";
import { BatchActionsBar } from "@/components/admin/BatchActionsBar";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function AdminDashboard() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_API_LIMIT,
  });
  const [isFiltering, setIsFiltering] = React.useState(false);

  const { data: stats } = useAdminStats();
  const { data: usersData, isLoading: isLoading } = useUsers({
    page: isFiltering ? 0 : pagination.pageIndex,
    limit: isFiltering ? MAX_TEACHER_FETCH_LIMIT : pagination.pageSize,
  });
  const { data: logs, isLoading: isLogsLoading } = useAuditLogs();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const users = usersData?.items ?? [];
  const pageCount = usersData?.pageCount ?? 0;
  const auditLogs = logs?.items ?? [];

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "lastName",
      header: "Nom",
    },
    {
      accessorKey: "firstName",
      header: "Prénom",
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
      cell: ({ row }) =>
        format(new Date(row.original.timestamp), "dd/MM/yyyy HH:mm"),
    },
    {
      accessorKey: "adminEmail",
      header: "Admin",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "details",
      header: "Détails",
    },
  ];

  const chartData = React.useMemo(() => [
    { name: "Étudiants", total: stats?.totalStudents || 0 },
    { name: "Enseignants", total: stats?.totalTeachers || 0 },
    { name: "Départements", total: stats?.totalDepartments || 0 },
    { name: "Salles", total: stats?.totalRooms || 0 },
  ], [stats]);

  const chartConfig = React.useMemo(() => ({
    total: { label: "Total", color: "var(--primary)" },
  } satisfies ChartConfig), []);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Aperçu global de l'activité du système.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Étudiants" value={stats?.totalStudents} icon={Users} />
        <StatsCard label="Enseignants" value={stats?.totalTeachers} icon={GraduationCap} />
        <StatsCard label="Départements" value={stats?.totalDepartments} icon={Building2} />
        <StatsCard label="Salles" value={stats?.totalRooms} icon={DoorOpen} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Distribution des Ressources</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {stats ? (
              <ChartContainer config={chartConfig} className="min-h-75 w-full">
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
            ) : (
              <Skeleton className="h-75 w-full" />
            )}
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
                  <CalendarCheck className="size-5 text-primary" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium">
                    {stats?.activeSessions ?? (
                      <Skeleton className="inline-block h-4 w-12" />
                    )}{" "}
                    Sessions Actives
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                  <History className="size-5 text-primary" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium">
                    {stats?.upcomingDefenses ?? (
                      <Skeleton className="inline-block h-4 w-12" />
                    )}{" "}
                    Soutenances
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
               <DataTable
                 columns={userColumns}
                 data={users}
                 loading={isLoading}
                 getRowId={(row) => row.id}
                 enableRowSelection
                 onSelectedRowsChange={setSelectedUsers}
                 manualPagination={!isFiltering}
                 pageCount={!isFiltering ? pageCount : undefined}
                 pagination={!isFiltering ? pagination : undefined}
                 onPaginationChange={!isFiltering ? setPagination : undefined}
                 onFiltering={setIsFiltering}
                 filterColumns={["lastName", "firstName", "email"]}
                 filterPlaceholder="Rechercher par nom, prénom ou email..."
                 filters={[
                   { column: "role", label: "Rôle", options: [{ value: "admin", label: "Admin" }, { value: "coordinator", label: "Coordinateur" }, { value: "teacher", label: "Enseignant" }, { value: "student", label: "Étudiant" }] },
                 ]}
               />
               
               <BatchActionsBar
                 selectedCount={selectedUsers.length}
                 entityLabel="utilisateur(s)"
                 actions={[{ key: "role", label: "Changer le rôle" }, { key: "delete", label: "Supprimer" }]}
                 fieldOptionsMap={{
                   role: [{ value: "coordinator", label: "Coordinateur" }, { value: "teacher", label: "Enseignant" }, { value: "student", label: "Étudiant" }],
                 }}
                 onUpdateField={async (field, value) => {
                   if (field === "role") {
                     await Promise.all(selectedUsers.map((u) => updateUser.mutateAsync({ id: u.id, data: { role: value as "coordinator" | "teacher" | "student" } })));
                   }
                 }}
                 onDeleteSelected={async () => {
                   await Promise.all(selectedUsers.map((u) => deleteUser.mutateAsync(u.id)));
                 }}
                 isPending={updateUser.isPending || deleteUser.isPending}
                 onClearSelection={() => setSelectedUsers([])}
               />
               
           </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Journal d'audit</CardTitle>
          </CardHeader>
          <CardContent>
              <DataTable
                  columns={logColumns}
                  data={auditLogs}
                  loading={isLogsLoading}
                  getRowId={(row) => row.id}
                filterColumns="action"
                filterPlaceholder="Rechercher par action..."
              />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
