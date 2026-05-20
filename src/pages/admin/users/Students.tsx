import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import {
  useStudents, useFilieres, useLevels,
  useCreateUser, useUpdateUser, useDeleteUser,
} from "@/hooks/use-queries";
import { type Student } from "@/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { studentSchema } from "@/lib/validations";
import { useCrud } from "@/hooks/use-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";

const FILTER_LIMIT = 5000;

export default function Students() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = useState(false);

  const { data: studentsData, isLoading, refetch } = useStudents(
    isFiltering ? 0 : pagination.pageIndex,
    isFiltering ? FILTER_LIMIT : pagination.pageSize,
  );
  const { data: filieres = [] } = useFilieres();
  const { data: levels = [] } = useLevels();
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const data = studentsData?.items ?? [];
  const pageCount = studentsData?.pageCount ?? 0;

  const crud = useCrud({
    schema: studentSchema,
    defaultForm: { lastName: "", firstName: "", email: "", cne: "", filiereId: "", levelId: "" },
    onCreate: (d) => create.mutateAsync({ ...d, role: "student", isActive: false }),
    onUpdate: (id, d) => update.mutateAsync({ id, data: { ...d, role: "student" as const } }),
    onDelete: (id) => del.mutateAsync(id),
    entityName: (s: Student) => `${s.lastName} ${s.firstName}`,
    mapToForm: (s: Student) => ({ lastName: s.lastName, firstName: s.firstName, email: s.email, cne: s.cne, filiereId: s.filiereId, levelId: s.levelId }),
    successMessages: {
      create: "Étudiant créé avec succès",
      update: "Étudiant modifié avec succès",
      delete: "Étudiant supprimé",
    },
  });

  const columns = useMemo<ColumnDef<Student>[]>(() => [
    { accessorKey: "cne", header: "CNE", cell: ({ row }) => <code className="font-bold">{row.getValue("cne")}</code> },
    { accessorKey: "lastName", header: "Nom", cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div> },
    { accessorKey: "firstName", header: "Prénom", cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div> },
    {
      accessorKey: "filiereId",
      header: "Filière",
      cell: ({ row }) => {
        const id = row.getValue("filiereId") as string;
        return filieres.find((f) => f.id === id)?.name || id;
      },
    },
    {
      accessorKey: "levelId",
      header: "Niveau",
      cell: ({ row }) => {
        const id = row.getValue("levelId") as string;
        const name = levels.find((l) => l.id === id)?.name || id;
        return <Badge variant="secondary">{name}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />,
    },
  ], [crud, filieres, levels]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground">Gestion des inscriptions et profils étudiants.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog entity="student" triggerButtonText="Importation en masse" onSuccess={refetch} />
          <Button onClick={crud.openCreate}>
            <Plus className="h-4 w-4" /> Nouvel Étudiant
          </Button>
        </div>
      </div>

        <DataTable columns={columns} data={data} loading={isLoading} getRowId={(row) => row.id}
          manualPagination={!isFiltering} pageCount={!isFiltering ? pageCount : undefined}
          pagination={!isFiltering ? pagination : undefined} onPaginationChange={!isFiltering ? setPagination : undefined}
          onFiltering={setIsFiltering}
          filterColumns={["lastName", "firstName", "email"]} filterPlaceholder="Rechercher par nom, prénom ou email..."
          filters={[
            { column: "filiereId", label: "Filière", options: filieres.map(f => ({ value: f.id, label: f.name })) },
            { column: "levelId", label: "Niveau", options: levels.map(l => ({ value: l.id, label: l.name })) },
          ]} />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{crud.selected ? "Modifier" : "Ajouter"} Étudiant</DialogTitle>
            <DialogDescription>Remplissez les informations académiques de l'étudiant.</DialogDescription>
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
              <Field>
                <FieldLabel>CNE</FieldLabel>
                <Input value={crud.formData.cne}
                  onChange={(e) => crud.setFormData({ ...crud.formData, cne: e.target.value })}
                  required error={crud.fieldErrors?.cne} />
              </Field>
              <Field>
                <FieldLabel>Niveau</FieldLabel>
                <Select value={crud.formData.levelId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, levelId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                  <SelectContent>
                    {levels.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.levelId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.levelId}</p>}
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Filière</FieldLabel>
                <Select value={crud.formData.filiereId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, filiereId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir une filière" /></SelectTrigger>
                  <SelectContent>
                    {filieres.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.filiereId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.filiereId}</p>}
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
