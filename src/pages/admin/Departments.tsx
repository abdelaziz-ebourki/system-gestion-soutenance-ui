
import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { validate, departmentSchema } from "@/lib/validations";
import { toastError } from "@/lib/utils";

export default function Departments() {
  const { data, isLoading } = useDepartments();
  const { data: teachers = [] } = useTeachersList();
  const createDeptMut = useCreateDepartment();
  const updateDeptMut = useUpdateDepartment();
  const deleteDeptMut = useDeleteDepartment();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(
    null,
  );

  // Form state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    headId: "",
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", headId: teachers?.[0]?.id || "" });
    setSelectedDept(null);
    setFieldErrors({});
  };

  const handleCreate = async () => {
    const errors = validate(departmentSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await createDeptMut.mutateAsync(formData);
      toast.success("Département ajouté avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la création");
    }
  };

  const handleUpdate = async () => {
    if (!selectedDept) return;
    const errors = validate(departmentSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateDeptMut.mutateAsync({ id: selectedDept.id, data: formData });
      toast.success("Département modifié avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la modification");
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (selectedDept) handleUpdate();
    else handleCreate();
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await deleteDeptMut.mutateAsync(selectedDept.id);
      toast.success("Département supprimé");
      setIsDeleteDialogOpen(false);
      setSelectedDept(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Department>[] = [
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
        const teacher = (teachers ?? []).find((t) => t.id === id);
        return teacher ? `${teacher.lastName} ${teacher.firstName}` : id;
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const department = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedDept(department);
                    setFormData({
                      name: department.name,
                      code: department.code,
                      headId: department.headId,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedDept(department);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Départements</h1>
          <p className="text-muted-foreground">Structure académique.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nouveau Département
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          filterColumn="name"
          filterPlaceholder="Rechercher par nom..."
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDept ? "Modifier" : "Ajouter"} Département
            </DialogTitle>
            <DialogDescription>
              Détails de l'unité académique.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Nom du Département</FieldLabel>
                <Input
                  placeholder="ex: Informatique"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  error={fieldErrors?.name}
                />
              </Field>
              <Field>
                <FieldLabel>Code</FieldLabel>
                <Input
                  placeholder="ex: INFO"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  error={fieldErrors?.code}
                />
              </Field>
              <Field>
                <FieldLabel>Chef de Département</FieldLabel>
                <Select
                  value={formData.headId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, headId: v || "" })
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
                {fieldErrors?.headId && <p className="text-sm font-medium text-destructive">{fieldErrors.headId}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                isLoading={selectedDept ? updateDeptMut.isPending : createDeptMut.isPending}
                loadingText="Enregistrement..."
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer le département {selectedDept?.name} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              variant="destructive"
              isLoading={deleteDeptMut.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
