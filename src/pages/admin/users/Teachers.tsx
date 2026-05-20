import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useTeachers, useDepartments, useGrades,
  useCreateUser, useUpdateUser, useDeleteUser,
} from "@/hooks/use-queries";
import type { Teacher } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { teacherSchema } from "@/lib/validations";
import { useCrud } from "@/hooks/use-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";

export default function Teachers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: teachersData, isLoading, refetch } = useTeachers(pagination.pageIndex, pagination.pageSize);
  const { data: departments = [] } = useDepartments();
  const { data: grades = [] } = useGrades();
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const data = teachersData?.items ?? [];
  const pageCount = teachersData?.pageCount ?? 0;

  const crud = useCrud({
    schema: teacherSchema,
    defaultForm: { lastName: "", firstName: "", email: "", gradeId: "", departmentId: "" },
    onCreate: (d) => create.mutateAsync({ ...d, role: "teacher", isActive: false }),
    onUpdate: (id, d) => update.mutateAsync({ id, data: { ...d, role: "teacher" as const } }),
    onDelete: (id) => del.mutateAsync(id),
    entityName: (s: Teacher) => `${s.lastName} ${s.firstName}`,
    mapToForm: (s: Teacher) => ({ lastName: s.lastName, firstName: s.firstName, email: s.email, gradeId: s.gradeId, departmentId: s.departmentId }),
    successMessages: {
      create: "Enseignant créé avec succès",
      update: "Enseignant modifié avec succès",
      delete: "Enseignant supprimé",
    },
  });

  const columns = useMemo<ColumnDef<Teacher>[]>(() => [
    { accessorKey: "lastName", header: "Nom", cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div> },
    { accessorKey: "firstName", header: "Prénom", cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div> },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "departmentId",
      header: "Département",
      cell: ({ row }) => {
        const id = row.getValue("departmentId") as string;
        return departments.find((d) => d.id === id)?.name || id;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />,
    },
  ], [crud, departments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">Gérez les comptes et affectations des enseignants.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog entity="teacher" triggerButtonText="Importation en masse" onSuccess={refetch} />
          <Button onClick={crud.openCreate}>
            <Plus className="h-4 w-4" /> Nouvel Enseignant
          </Button>
        </div>
      </div>

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <DataTable columns={columns} data={data} manualPagination pageCount={pageCount}
          pagination={pagination} onPaginationChange={setPagination}
          filterColumn="lastName" filterPlaceholder="Rechercher par nom..."
          filters={[
            { column: "departmentId", label: "Département", options: departments.map(d => ({ value: d.id, label: d.name })) },
          ]} />
      )}

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
                <FieldLabel>Grade</FieldLabel>
                <Select value={crud.formData.gradeId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, gradeId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un grade" /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.gradeId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.gradeId}</p>}
              </Field>
              <Field>
                <FieldLabel>Département</FieldLabel>
                <Select value={crud.formData.departmentId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, departmentId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un département" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.departmentId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.departmentId}</p>}
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
