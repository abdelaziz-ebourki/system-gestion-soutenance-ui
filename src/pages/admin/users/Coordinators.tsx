import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useCoordinators, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-queries";
import type { Coordinator } from "@/types";
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
  Input,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { coordinatorSchema } from "@/lib/validations";
import { useCrud } from "@/hooks/use-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";

const FILTER_LIMIT = 5000;

export default function Coordinators() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = useState(false);

  const { data: coordinatorsData, isLoading } = useCoordinators(
    isFiltering ? 0 : pagination.pageIndex,
    isFiltering ? FILTER_LIMIT : pagination.pageSize,
  );
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const data = coordinatorsData?.items ?? [];
  const pageCount = coordinatorsData?.pageCount ?? 0;

  const crud = useCrud({
    schema: coordinatorSchema,
    defaultForm: { lastName: "", firstName: "", email: "" },
    onCreate: (d) => create.mutateAsync({ ...d, role: "coordinator", isActive: false }),
    onUpdate: (id, d) => update.mutateAsync({ id, data: { ...d, role: "coordinator" as const } }),
    onDelete: (id) => del.mutateAsync(id),
    entityName: (c: Coordinator) => `${c.lastName} ${c.firstName}`,
    mapToForm: (c: Coordinator) => ({ lastName: c.lastName, firstName: c.firstName, email: c.email }),
    successMessages: {
      create: "Coordinateur ajouté avec succès",
      update: "Coordinateur modifié avec succès",
      delete: "Coordinateur supprimé",
    },
  });

  const columns = useMemo<ColumnDef<Coordinator>[]>(() => [
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
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />,
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coordinateurs</h1>
          <p className="text-muted-foreground">Gestion des responsables des soutenances.</p>
        </div>
        <Button onClick={crud.openCreate}>
          <Plus className="h-4 w-4" /> Nouveau Coordinateur
        </Button>
      </div>

        <DataTable columns={columns} data={data} loading={isLoading} getRowId={(row) => row.id}
          manualPagination={!isFiltering} pageCount={!isFiltering ? pageCount : undefined}
          pagination={!isFiltering ? pagination : undefined} onPaginationChange={!isFiltering ? setPagination : undefined}
          onFiltering={setIsFiltering}
          filterColumns={["lastName", "firstName", "email"]} filterPlaceholder="Rechercher par nom, prénom ou email..." />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{crud.selected ? "Modifier" : "Ajouter"} Coordinateur</DialogTitle>
            <DialogDescription>Compte administratif de gestion de filière.</DialogDescription>
          </DialogHeader>
          <form onSubmit={crud.handleSubmit}>
            <FieldGroup className="grid grid-cols-2 gap-4 py-4">
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <Input value={crud.formData.lastName}
                  onChange={(e) => crud.setFormData({ ...crud.formData, lastName: e.target.value })}
                  required error={crud.fieldErrors?.lastName} />
              </Field>
              <Field>
                <FieldLabel>Prénom</FieldLabel>
                <Input value={crud.formData.firstName}
                  onChange={(e) => crud.setFormData({ ...crud.formData, firstName: e.target.value })}
                  required error={crud.fieldErrors?.firstName} />
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Email</FieldLabel>
                <Input type="email" value={crud.formData.email}
                  onChange={(e) => crud.setFormData({ ...crud.formData, email: e.target.value })}
                  required error={crud.fieldErrors?.email} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" isLoading={create.isPending || update.isPending} loadingText="Enregistrement...">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected ? `${crud.selected.lastName} ${crud.selected.firstName}` : undefined} isPending={del.isPending} />
    </div>
  );
}
