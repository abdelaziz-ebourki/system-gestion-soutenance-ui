import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  FolderKanban,
  CircleAlert,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { useProjects, useUpdateProject, useDeleteProject } from "@/hooks/use-queries";
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
  StatsCard,
} from "@/components/ui";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
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
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const projects = projectsQuery.data ?? [];
  const isLoading = projectsQuery.isLoading;
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [batchDialog, setBatchDialog] = useState<"status" | "delete" | null>(null);
  const [batchValue, setBatchValue] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      toast.success("Projet supprimé");
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
          {row.original.studentNames?.join(", ") || "Étudiants non renseignés"}
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
            <Trash2 className="size-4" />
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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Projets & Groupes
          </h1>
          <p className="text-muted-foreground">
            Pilotez les sujets, les groupes d'étudiants et la maturité des
            dossiers avant composition des jurys.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Ajouter un projet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Portefeuille" value={projects.length} icon={FolderKanban} />
        <StatsCard label="Groupes complets" value={multiMemberGroups.length} icon={Users} />
        <StatsCard label="A valider" value={pendingProjects.length} icon={CircleAlert} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des projets</CardTitle>
          <CardDescription>
            Recherchez, mettez à jour ou supprimez un dossier depuis la même
            table.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
              columns={columns}
              data={projects}
              loading={isLoading}
              getRowId={(row) => row.id}
              enableRowSelection
              onSelectedRowsChange={setSelectedProjects}
              filterColumns="title"
              filterPlaceholder="Rechercher un projet..."
              filters={[
                { column: "status", label: "Statut", options: [{ value: "pending", label: "En attente" }, { value: "approved", label: "Valide" }, { value: "rejected", label: "Refuse" }] },
              ]}
            />
        </CardContent>
      </Card>

      {selectedProjects.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">{selectedProjects.length} projet(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setBatchDialog("status"); setBatchValue(""); }}>
              Changer le statut
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={batchDialog === "status"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>{selectedProjects.length} projet(s) sélectionné(s).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Valide</SelectItem>
                <SelectItem value="rejected">Refuse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
            <Button onClick={async () => {
              if (!batchValue) return;
              try {
                await Promise.all(selectedProjects.map((p) => updateProjectMutation.mutateAsync({ id: p.id, data: { status: batchValue as Project["status"] } })));
                toast.success(`${selectedProjects.length} projet(s) mis à jour`);
                setSelectedProjects([]);
                setBatchDialog(null);
              } catch {
                toast.error("Erreur lors de la mise à jour");
              }
            }} isLoading={updateProjectMutation.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedProjects.length} projet(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedProjects.map((p) => deleteProjectMutation.mutateAsync(p.id)));
            toast.success(`${selectedProjects.length} projet(s) supprimé(s)`);
            setSelectedProjects([]);
            setBatchDialog(null);
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={deleteProjectMutation.isPending}
      />

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
