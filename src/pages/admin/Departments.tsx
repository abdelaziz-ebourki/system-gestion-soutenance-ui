import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { useDepartments, useTeachersList } from "@/hooks/queries";
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
import { useDepartmentCrud } from "@/hooks/entities/use-department-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { BatchActionsBar } from "@/components/admin/BatchActionsBar";

export default function Departments() {
  const { data, isLoading } = useDepartments();
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const { data: teachers = [] } = useTeachersList();
  const crud = useDepartmentCrud();

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
        const id = row.getValue("headId") as string | undefined;
        if (!id) return <span className="text-muted-foreground italic">Non assigné</span>;
        const teacher = teachers.find((t) => t.id === id);
        return teacher ? `${teacher.lastName} ${teacher.firstName}` : id;
      },
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
  ], [crud, teachers]);

  return (
    <div className="space-y-6 pb-20" data-testid="admin-departments-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Départements</h1>
          <p className="text-muted-foreground">Structure académique.</p>
        </div>
        <Button onClick={crud.openCreate} data-testid="admin-departments-add-button">
          <Plus className="size-4" /> Nouveau Département
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

      <BatchActionsBar
        selectedCount={selectedDepartments.length}
        entityLabel="département(s)"
        actions={[{ key: "delete", label: "Supprimer" }]}
        onDeleteSelected={async () => {
          await Promise.all(selectedDepartments.map((d) => crud.deleteMutation(d.id)));
        }}
        isPending={crud.isDeletePending}
        onClearSelection={() => setSelectedDepartments([])}
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
                  value={crud.formData.headId || "none"}
                  onValueChange={(v) =>
                    crud.setFormData({ ...crud.formData, headId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.lastName} {t.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                isLoading={crud.isCreatePending || crud.isUpdatePending}
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
        isPending={crud.isDeletePending}
      />
    </div>
  );
}

