import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, UserPlus, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { useJuries, useProjects, useDeleteJury } from "@/hooks/use-queries";
import type { Jury } from "@/types";
import { toastError } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
} from "@/components/ui";
import { CreateJuryDialog } from "@/components/academic/CreateJuryDialog";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

export default function Jurys() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [juryToDelete, setJuryToDelete] = useState<Jury | null>(null);

  const { data: juries = [], isLoading } = useJuries();
  const { data: projects = [] } = useProjects();
  const deleteJury = useDeleteJury();

  const columns: ColumnDef<Jury>[] = [
    {
      accessorKey: "projectTitle",
      header: "Projet",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate font-medium" title={row.original.projectTitle}>
          {row.original.projectTitle}
        </div>
      ),
    },
    {
      accessorKey: "studentNames",
      header: "Étudiants",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.studentNames.map((name) => (
            <Badge key={name} variant="secondary" className="text-[10px]">
              {name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "members",
      header: "Jury",
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.members.map((m) => (
            <div key={m.teacherId} className="text-xs">
              <span className="font-bold text-muted-foreground mr-1 uppercase">{m.role}:</span>
              {m.teacherName}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setJuryToDelete(row.original)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-testid="coord-juries-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Jurys</h1>
          <p className="text-muted-foreground">
            Configurez les commissions d'examen pour chaque soutenance.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2" data-testid="coord-juries-add-button">
          <UserPlus className="size-4" /> Nouveau Jury
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jurys</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{juries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets sans Jury</CardTitle>
            <AlertTriangle className="size-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter((p) => !juries.find((j) => j.projectId === p.id)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérification</CardTitle>
            <ShieldCheck className="size-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">OK</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={juries}
            loading={isLoading}
            filterColumns="projectTitle"
            filterPlaceholder="Filtrer par projet..."
          />
        </CardContent>
      </Card>

      <CreateJuryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />

      <DeleteAlert
        isOpen={!!juryToDelete}
        onOpenChange={(open) => !open && setJuryToDelete(null)}
        entityName={`le jury pour "${juryToDelete?.projectTitle}"`}
        onDelete={async () => {
          if (!juryToDelete) return;
          try {
            await deleteJury.mutateAsync(juryToDelete.id);
            toast.success("Jury supprimé avec succès");
            setJuryToDelete(null);
          } catch (error) {
            toastError(error, "Erreur lors de la suppression du jury");
          }
        }}
        isPending={deleteJury.isPending}
      />
    </div>
  );
}
