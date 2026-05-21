import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useTeachers, useDepartments, useGrades } from "@/hooks/use-queries";
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
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useTeacherCrud } from "@/hooks/entities/use-teacher-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const FILTER_LIMIT = 5000;

export default function Teachers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [batchDialog, setBatchDialog] = useState<"department" | "delete" | null>(null);
  const [batchValue, setBatchValue] = useState("");

  const { data: teachersData, isLoading, refetch } = useTeachers(
    isFiltering ? 0 : pagination.pageIndex,
    isFiltering ? FILTER_LIMIT : pagination.pageSize,
  );
  const { data: departments = [] } = useDepartments();
  const { data: grades = [] } = useGrades();
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
  ], [crud, departments, grades]);

  return (
    <div className="space-y-6 pb-20">
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

        <DataTable columns={columns} data={data} loading={isLoading} getRowId={(row) => row.id} enableRowSelection onSelectedRowsChange={setSelectedTeachers}
          manualPagination={!isFiltering} pageCount={!isFiltering ? pageCount : undefined}
          pagination={!isFiltering ? pagination : undefined} onPaginationChange={!isFiltering ? setPagination : undefined}
          onFiltering={setIsFiltering}
          filterColumns={["lastName", "firstName", "email"]} filterPlaceholder="Rechercher par nom, prénom ou email..."
          filters={[
            { column: "departmentId", label: "Département", options: departments.map(d => ({ value: d.id, label: d.name })) },
          ]} />

      {selectedTeachers.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">{selectedTeachers.length} enseignant(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setBatchDialog("department"); setBatchValue(""); }}>
              Modifier le département
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={batchDialog === "department"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le département</DialogTitle>
            <DialogDescription>{selectedTeachers.length} enseignant(s) sélectionné(s).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choisir un département" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
            <Button onClick={async () => {
              if (!batchValue) return;
              try {
                await Promise.all(selectedTeachers.map((t) => crud.updateMutation(t.id, { departmentId: batchValue, role: "teacher" as const })));
                toast.success(`${selectedTeachers.length} enseignant(s) mis à jour`);
                setSelectedTeachers([]);
                setBatchDialog(null);
                refetch();
              } catch {
                toast.error("Erreur lors de la mise à jour");
              }
            }} isLoading={crud.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedTeachers.length} enseignant(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedTeachers.map((t) => crud.deleteMutation(t.id)));
            toast.success(`${selectedTeachers.length} enseignant(s) supprimé(s)`);
            setSelectedTeachers([]);
            setBatchDialog(null);
            refetch();
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={crud.isPending}
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
              <Button type="submit" isLoading={crud.isPending} loadingText="Enregistrement...">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected ? `${crud.selected.lastName} ${crud.selected.firstName}` : undefined} isPending={crud.isPending} />
    </div>
  );
}
