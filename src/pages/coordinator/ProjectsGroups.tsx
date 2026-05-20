import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash,
  Users,
  FolderKanban,
  CircleAlert,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { useProjects, useDeleteProject } from "@/hooks/use-queries";
import type { Project } from "@/types";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { DataTable } from "@/components/ui/data-table";
import { ProjectDialog } from "@/components/academic/ProjectDialog";

const statusLabel: Record<Project["status"], string> = {
  pending: "En attente",
  approved: "Valide",
  rejected: "Refuse",
};

const statusClass: Record<Project["status"], string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export default function CoordinatorProjects() {
  const projectsQuery = useProjects();
  const deleteProjectMutation = useDeleteProject();
  const projects = projectsQuery.data ?? [];
  const isLoading = projectsQuery.isLoading;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      toast.success("Projet supprime");
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: "Projet",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.description || "Aucune description"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "studentNames",
      header: "Groupe",
      cell: ({ row }) => (
        <div className="max-w-65 text-sm">
          {row.original.studentNames?.join(", ") || "Etudiants non renseignes"}
        </div>
      ),
    },
    {
      accessorKey: "supervisorName",
      header: "Encadrant",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge className={statusClass[row.original.status]}>
          {statusLabel[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingProject(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const pendingProjects = useMemo(() => projects.filter(
    (project) => project.status === "pending",
  ), [projects]);
  const multiMemberGroups = useMemo(() => projects.filter(
    (project) => (project.studentIds?.length || 0) > 1,
  ), [projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Projets & Groupes
          </h1>
          <p className="text-muted-foreground">
            Pilotez les sujets, les groupes d'etudiants et la maturite des
            dossiers avant composition des jurys.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Ajouter un projet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Portefeuille</p>
              <p className="mt-2 text-3xl font-semibold">{projects.length}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <FolderKanban className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Groupes complets</p>
              <p className="mt-2 text-3xl font-semibold">
                {multiMemberGroups.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">A valider</p>
              <p className="mt-2 text-3xl font-semibold">
                {pendingProjects.length}
              </p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
              <CircleAlert className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des projets</CardTitle>
          <CardDescription>
            Recherchez, mettez a jour ou supprimez un dossier depuis la meme
            table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Chargement des projets...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={projects}
              filterColumn="title"
              filterPlaceholder="Rechercher un projet..."
              filters={[
                { column: "status", label: "Statut", options: [{ value: "pending", label: "En attente" }, { value: "approved", label: "Valide" }, { value: "rejected", label: "Refuse" }] },
              ]}
            />
          )}
        </CardContent>
      </Card>

      <ProjectDialog
        open={isCreateOpen || Boolean(editingProject)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingProject(null);
          }
        }}
        project={editingProject}
        onSuccess={() => {}}
      />
    </div>
  );
}
