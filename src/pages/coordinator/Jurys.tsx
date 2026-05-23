import { useMemo, useState } from "react";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, UserPlus, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { useJuries, useProjects, useTeachersList, useDeleteJury } from "@/hooks/use-queries";
import type { Jury } from "@/types";
import { toastError } from "@/lib/utils";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
} from "@/components/ui";
import { DataTable } from "@/components/ui/data-table";
import { CreateJuryDialog } from "@/components/academic/CreateJuryDialog";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

export default function Jurys() {
  const juriesQuery = useJuries();
  const teachersQuery = useTeachersList();
  const projectsQuery = useProjects();
  const deleteJuryMutation = useDeleteJury();
  const juries = juriesQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const isLoading = juriesQuery.isLoading || teachersQuery.isLoading || projectsQuery.isLoading;
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingJury, setEditingJury] = useState<Jury | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Jury | null>(null);
  const isDialogOpen = isCreateOpen || editingJury !== null;
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setIsCreateOpen(false);
      setEditingJury(null);
    }
  };

  const teachersLoad = React.useMemo(() => {
    const counts = new Map<string, number>();
    juries.forEach((jury) => {
      jury.members.forEach((m) => {
        counts.set(m.teacherId, (counts.get(m.teacherId) || 0) + 1);
      });
    });
    return counts;
  }, [juries]);

  const projectsWithoutJury = useMemo(() => projects.filter(
    (project) => !juries.some((jury) => jury.projectId === project.id),
  ), [projects, juries]);

  const columns = useMemo<ColumnDef<Jury>[]>(() => [
    {
      accessorKey: "projectTitle",
      header: "Projet",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.projectTitle}</div>
          <div className="text-xs text-muted-foreground">
            {projects
              .find((project) => project.id === row.original.projectId)
              ?.studentNames?.join(", ") || "Groupe non renseigné"}
          </div>
        </div>
      ),
    },
    {
      id: "members",
      header: "Membres",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.members.map((m, i) => (
            <Badge key={i} variant="secondary" className="whitespace-nowrap text-xs">
              {m.roleName}: {m.teacherName}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "templateName",
      header: "Modèle",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.templateName}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <CrudActions entity={row.original} onEdit={setEditingJury} onDelete={setDeleteTarget} />
        </div>
      ),
    },
  ], [projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des jurys
          </h1>
          <p className="text-muted-foreground">
            Composez des jurys lisibles, répartissez la charge et fermez les
            trous avant la planification.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <UserPlus className="size-4" />
          Nouveau jury
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Jurys composés" value={juries.length} icon={ShieldCheck} />
        <StatsCard label="Projets sans jury" value={projectsWithoutJury.length} icon={AlertTriangle} />
        <StatsCard label="Enseignants mobilisés" value={`${Array.from(teachersLoad.keys()).length}/${teachers.length}`} icon={Users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Composition des jurys</CardTitle>
            <CardDescription>
              Chaque ligne correspond à un projet avec les membres de son jury.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <DataTable
                columns={columns}
                data={juries}
                loading={isLoading}
                getRowId={(row) => row.id}
                filterColumns="projectTitle"
                filterPlaceholder="Rechercher un projet..."
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charge enseignants</CardTitle>
            <CardDescription>
              Un aperçu rapide pour éviter de surcharger toujours les mêmes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teachers.length > 0 ? (
              teachers.map((teacher) => {
              const fullName = `${teacher.lastName} ${teacher.firstName}`;
              const load = teachersLoad.get(teacher.id) || 0;

              return (
                <div key={teacher.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                    </div>
                    <Badge>
                      {load} affectation{load > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              );
            })
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun enseignant à afficher.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateJuryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        jury={editingJury}
        onSuccess={() => {}}
      />

      <DeleteAlert
        isOpen={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        entityName={deleteTarget?.projectTitle}
        onDelete={async () => {
          if (!deleteTarget) return;
          try {
            await deleteJuryMutation.mutateAsync(deleteTarget.id);
            toast.success("Jury supprimé");
            setDeleteTarget(null);
          } catch (error) {
            toastError(error, "Erreur lors de la suppression");
          }
        }}
        isPending={deleteJuryMutation.isPending}
      />
    </div>
  );
}
