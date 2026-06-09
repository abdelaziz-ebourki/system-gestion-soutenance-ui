import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";

import { useTeachers, useDepartments } from "@/hooks/use-queries";
import type { Teacher } from "@/types";
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
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { BatchActionsBar } from "@/components/admin/BatchActionsBar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useTeacherCrud } from "@/hooks/entities/use-teacher-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";
import { DEFAULT_API_LIMIT, MAX_TEACHER_FETCH_LIMIT } from "@/lib/constants";

export default function Teachers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_API_LIMIT,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);

  const { data: teachersData, isLoading, refetch } = useTeachers({
    page: isFiltering ? 0 : pagination.pageIndex,
    limit: isFiltering ? MAX_TEACHER_FETCH_LIMIT : pagination.pageSize,
  });
  const { data: departments = [] } = useDepartments();
  const crud = useTeacherCrud();

  const data = teachersData?.items ?? [];
  const pageCount = teachersData?.pageCount ?? 0;

  const columns = useMemo<ColumnDef<Teacher>[]>(() => [
    { accessorKey: "lastName", header: "Nom", cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div> },
    { accessorKey: "firstName", header: "Prénom", cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div> },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "departmentId",
      header: "Département",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const id = row.getValue("departmentId") as number;
        return departments.find((d) => d.id === id)?.name || id;
      },
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
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />
        </div>
      ),
    },
  ], [crud, departments]);

  if (departments.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Users}
          title="Configuration requise"
          description="Vous devez d'abord configurer les départements avant de pouvoir gérer les enseignants."
          action={<Button asChild><Link to="/admin/departments">Départements</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20" data-testid="admin-teachers-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">Gérez les comptes et affectations des enseignants.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog entity="teacher" triggerButtonText="Importation en masse" onSuccess={refetch} />
          <Button onClick={crud.openCreate} data-testid="admin-teachers-add-button">
            <Plus className="size-4" /> Nouvel Enseignant
          </Button>
        </div>
      </div>

        <DataTable columns={columns} data={data} loading={isLoading} getRowId={(row) => row.id} enableRowSelection onSelectedRowsChange={setSelectedTeachers}
          manualPagination={!isFiltering} pageCount={!isFiltering ? pageCount : undefined}
          pagination={!isFiltering ? pagination : undefined} onPaginationChange={!isFiltering ? setPagination : undefined}
          onFiltering={setIsFiltering}
          filterColumns={["lastName", "firstName", "email"]} filterPlaceholder="Rechercher par nom, prénom ou email..."
          filters={[
            { column: "departmentId", label: "Département", options: departments.map(d => ({ value: String(d.id), label: d.name })) },
          ]} />

      <BatchActionsBar
        selectedCount={selectedTeachers.length}
        entityLabel="enseignant(s)"
        actions={[{ key: "department", label: "Modifier le département" }, { key: "delete", label: "Supprimer" }]}
        fieldOptionsMap={{
          department: departments.map((d) => ({ value: String(d.id), label: d.name })),
        }}
        onUpdateField={async (_field, value) => {
          await Promise.all(selectedTeachers.map((t) => crud.updateMutation(t.id, { lastName: t.lastName, firstName: t.firstName, email: t.email, departmentId: Number(value), role: "TEACHER" })));
        }}
        onDeleteSelected={async () => {
          await Promise.all(selectedTeachers.map((t) => crud.deleteMutation(t.id)));
        }}
        isPending={crud.isDeletePending}
        onClearSelection={() => setSelectedTeachers([])}
      />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{crud.selected ? "Modifier" : "Ajouter"} Enseignant</DialogTitle>
            <DialogDescription>Remplissez les informations de l'enseignant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={crud.handleSubmit}>
            <FieldGroup className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" value={crud.formData.email}
                  onChange={(e) => crud.setFormData({ ...crud.formData, email: e.target.value })}
                  required error={crud.fieldErrors?.email} />
              </Field>
              <Field>
                <FieldLabel>Département</FieldLabel>
                <Select value={crud.formData.departmentId ? String(crud.formData.departmentId) : ""}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, departmentId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un département" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.departmentId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.departmentId}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" isLoading={crud.isCreatePending || crud.isUpdatePending} loadingText="Enregistrement...">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected ? `${crud.selected.lastName} ${crud.selected.firstName}` : undefined} isPending={crud.isDeletePending} />
    </div>
  );
}
