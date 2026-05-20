import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useTeachersList,
} from "@/hooks/use-queries";
import { type Department } from "@/types";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { departmentSchema } from "@/lib/validations";
import { useCrud } from "@/hooks/use-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

export default function Departments() {
  const { data, isLoading, refetch } = useDepartments();
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [batchDialog, setBatchDialog] = useState<"delete" | null>(null);
  const { data: teachers = [] } = useTeachersList();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const del = useDeleteDepartment();

  const crud = useCrud({
    schema: departmentSchema,
    defaultForm: { name: "", code: "", headId: "" },
    onCreate: (d) => create.mutateAsync(d),
    onUpdate: (id, d) => update.mutateAsync({ id, data: d }),
    onDelete: (id) => del.mutateAsync(id),
    mapToForm: (d: Department) => ({ name: d.name, code: d.code, headId: d.headId }),
    successMessages: {
      create: "Département ajouté avec succès",
      update: "Département modifié avec succès",
      delete: "Département supprimé",
    },
  });

  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-mono font-bold">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nom du Département",
    },
    {
      accessorKey: "headId",
      header: "Chef de Département",
      cell: ({ row }) => {
        const id = row.getValue("headId") as string;
        const teacher = teachers.find((t) => t.id === id);
        return teacher ? `${teacher.lastName} ${teacher.firstName}` : id;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />
      ),
    },
  ], [crud, teachers]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Départements</h1>
          <p className="text-muted-foreground">Structure académique.</p>
        </div>
        <Button onClick={crud.openCreate}>
          <Plus className="h-4 w-4" /> Nouveau Département
        </Button>
      </div>

        <DataTable
          columns={columns}
          data={data ?? []}
          loading={isLoading}
          getRowId={(row) => row.id}
          enableRowSelection
          onSelectedRowsChange={setSelectedDepartments}
          filterColumns="name"
          filterPlaceholder="Rechercher par nom..."
        />

      {selectedDepartments.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">{selectedDepartments.length} département(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>Supprimer</Button>
          </div>
        </div>
      )}

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedDepartments.length} département(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedDepartments.map((d) => del.mutateAsync(d.id)));
            toast.success(`${selectedDepartments.length} département(s) supprimé(s)`);
            setSelectedDepartments([]);
            setBatchDialog(null);
            refetch();
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={del.isPending}
      />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {crud.selected ? "Modifier" : "Ajouter"} Département
            </DialogTitle>
            <DialogDescription>
              Détails de l'unité académique.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={crud.handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Nom du Département</FieldLabel>
                <Input
                  placeholder="ex: Informatique"
                  value={crud.formData.name}
                  onChange={(e) =>
                    crud.setFormData({ ...crud.formData, name: e.target.value })
                  }
                  required
                  error={crud.fieldErrors?.name}
                />
              </Field>
              <Field>
                <FieldLabel>Code</FieldLabel>
                <Input
                  placeholder="ex: INFO"
                  value={crud.formData.code}
                  onChange={(e) =>
                    crud.setFormData({ ...crud.formData, code: e.target.value })
                  }
                  required
                  error={crud.fieldErrors?.code}
                />
              </Field>
              <Field>
                <FieldLabel>Chef de Département</FieldLabel>
                <Select
                  value={crud.formData.headId}
                  onValueChange={(v) =>
                    crud.setFormData({ ...crud.formData, headId: v || "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.lastName} {t.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.headId && (
                  <p className="text-sm font-medium text-destructive">{crud.fieldErrors.headId}</p>
                )}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                isLoading={update.isPending || create.isPending}
                loadingText="Enregistrement..."
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={crud.isDeleteDialogOpen}
        onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete}
        entityName={crud.selected?.name}
        isPending={del.isPending}
      />
    </div>
  );
}
