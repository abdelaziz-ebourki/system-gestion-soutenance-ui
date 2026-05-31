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

import { useAdminStats, useUsers, useAuditLogs, useUpdateUser, useDeleteUser } from "@/hooks/use-queries";
import type { User } from "@/types";
import type { AuditLog } from "@/types/audit-log";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatsCard,
} from "@/components/ui";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const FILTER_LIMIT = 5000;

export default function AdminDashboard() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = React.useState(false);

  const { data: stats } = useAdminStats();
  const { data: usersData, isLoading: isLoading } = useUsers({
    page: isFiltering ? 0 : pagination.pageIndex,
    limit: isFiltering ? FILTER_LIMIT : pagination.pageSize,
  });
  const { data: logs, isLoading: isLogsLoading } = useAuditLogs();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
  const [batchDialog, setBatchDialog] = React.useState<"role" | "delete" | null>(null);
  const [batchValue, setBatchValue] = React.useState("");

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

              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
                  <span className="text-sm font-medium">{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setBatchDialog("role"); setBatchValue(""); }}>
                      Changer le rôle
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}

              <Dialog open={batchDialog === "role"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le rôle</DialogTitle>
                    <DialogDescription>{selectedUsers.length} utilisateur(s) sélectionné(s).</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
                      <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordinator">Coordinateur</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
                        <SelectItem value="student">Étudiant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
                    <Button onClick={async () => {
                      if (!batchValue) return;
                      try {
                        await Promise.all(selectedUsers.map((u) => updateUser.mutateAsync({ id: u.id, data: { role: batchValue as "coordinator" | "teacher" | "student" } })));
                        toast.success(`${selectedUsers.length} utilisateur(s) mis à jour`);
                        setSelectedUsers([]);
                        setBatchDialog(null);
                      } catch {
                        toast.error("Erreur lors de la mise à jour");
                      }
                    }} isLoading={updateUser.isPending}>Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DeleteAlert
                isOpen={batchDialog === "delete"}
                onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
                entityName={`${selectedUsers.length} utilisateur(s)`}
                onDelete={async () => {
                  try {
                    await Promise.all(selectedUsers.map((u) => deleteUser.mutateAsync(u.id)));
                    toast.success(`${selectedUsers.length} utilisateur(s) supprimé(s)`);
                    setSelectedUsers([]);
                    setBatchDialog(null);
                  } catch {
                    toast.error("Erreur lors de la suppression");
                  }
                }}
                isPending={deleteUser.isPending}
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
