import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Session } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { sessionSchema } from "@/lib/validations";
import { useCrud } from "@/hooks/use-crud";
import { useSessions, useCreateSession, useUpdateSession, useDeleteSession } from "@/hooks/use-queries";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

const statusBadge: Record<string, "default" | "secondary"> = {
  active: "default",
  draft: "secondary",
  archived: "secondary",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  draft: "Brouillon",
  archived: "Archivée",
};

export default function Sessions() {
  const { data, isLoading } = useSessions();
  const create = useCreateSession();
  const update = useUpdateSession();
  const del = useDeleteSession();

  const crud = useCrud({
    schema: sessionSchema,
    defaultForm: { name: "", type: "Normale", status: "draft", startDate: "", endDate: "" },
    onCreate: (d) => create.mutateAsync(d as Parameters<typeof create.mutateAsync>[0]),
    onUpdate: (id, d) => update.mutateAsync({ id, data: d as Parameters<typeof create.mutateAsync>[0] }),
    onDelete: (id) => del.mutateAsync(id),
    entityName: (s: Session) => s.name,
    mapToForm: (s: Session) => ({ name: s.name, type: s.type, status: s.status, startDate: s.startDate, endDate: s.endDate }),
    successMessages: {
      create: "Session créée avec succès",
      update: "Session modifiée avec succès",
      delete: "Session supprimée",
    },
  });

  const columns = useMemo<ColumnDef<Session>[]>(() => [
    { accessorKey: "name", header: "Nom de la Session", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline" className="rounded-md">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={statusBadge[status] ?? "secondary"} className="rounded-md capitalize">{statusLabel[status] ?? status}</Badge>;
      },
    },
    {
      accessorKey: "startDate",
      header: "Début",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground">
          <Calendar className="mr-2 h-3 w-3" />
          {row.getValue("startDate")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "Fin",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground">
          <Calendar className="mr-2 h-3 w-3" />
          {row.getValue("endDate")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => crud.openEdit(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => crud.openDelete(row.original)}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions Globales</h1>
          <p className="text-muted-foreground">Définissez les périodes académiques pour les soutenances.</p>
        </div>
        <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Nouvelle Session</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.selected ? "Modifier la session" : "Créer une Session"}</DialogTitle>
              <DialogDescription>
                {crud.selected ? "Mettez à jour les informations de la session." : "Configurez une nouvelle période de soutenance."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={crud.handleSubmit}>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Nom de la Session</FieldLabel>
                  <Input placeholder="ex: Session Normale 2026" value={crud.formData.name}
                    onChange={(e) => crud.setFormData({ ...crud.formData, name: e.target.value })}
                    required error={crud.fieldErrors?.name} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select value={crud.formData.type}
                      onValueChange={(val) => crud.setFormData({ ...crud.formData, type: val ?? "Normale" })}>
                      <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normale">Normale</SelectItem>
                        <SelectItem value="Rattrapage">Rattrapage</SelectItem>
                        <SelectItem value="Spéciale">Spéciale</SelectItem>
                      </SelectContent>
                    </Select>
                    {crud.fieldErrors?.type && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.type}</p>}
                  </Field>
                  <Field>
                    <FieldLabel>Statut Initial</FieldLabel>
                    <Select value={crud.formData.status === "active" ? "Active" : crud.formData.status === "draft" ? "Brouillon" : "Archivée"}
                      onValueChange={(val) => crud.setFormData({
                        ...crud.formData,
                        status: val === "Active" ? "active" : val === "Brouillon" ? "draft" : "archived",
                      })}>
                      <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brouillon">Brouillon</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Archivée">Archivée</SelectItem>
                      </SelectContent>
                    </Select>
                    {crud.fieldErrors?.status && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.status}</p>}
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Date de début</FieldLabel>
                    <Input type="date" value={crud.formData.startDate}
                      onChange={(e) => crud.setFormData({ ...crud.formData, startDate: e.target.value })}
                      required error={crud.fieldErrors?.startDate} />
                  </Field>
                  <Field>
                    <FieldLabel>Date de fin</FieldLabel>
                    <Input type="date" value={crud.formData.endDate}
                      onChange={(e) => crud.setFormData({ ...crud.formData, endDate: e.target.value })}
                      required error={crud.fieldErrors?.endDate} />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => crud.setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" isLoading={create.isPending || update.isPending} loadingText="Enregistrement...">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <DataTable columns={columns} data={data ?? []} filterColumn="name" filterPlaceholder="Rechercher une session..." />
      )}

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected?.name} isPending={del.isPending} />
    </div>
  );
}
