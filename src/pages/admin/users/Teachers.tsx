
import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  useTeachers, useGrades, useDepartments,
  useCreateUser, useUpdateUser, useDeleteUser,
} from "@/hooks/use-queries";
import { type Teacher } from "@/types";
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
  Badge,
  Skeleton,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { validate, teacherSchema } from "@/lib/validations";
import { toastError } from "@/lib/utils";

export default function Teachers() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: teachersData, isLoading, refetch } = useTeachers(pagination.pageIndex, pagination.pageSize);
  const { data: grades = [] } = useGrades();
  const { data: departments = [] } = useDepartments();
  const createUserMut = useCreateUser();
  const updateUserMut = useUpdateUser();
  const deleteUserMut = useDeleteUser();

  const data = teachersData?.items ?? [];
  const pageCount = teachersData?.pageCount ?? 0;

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(
    null,
  );

  // Form state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState({
    lastName: "",
    firstName: "",
    email: "",
    gradeId: "",
    departmentId: "",
  });

  const resetForm = () => {
    setFormData({
      lastName: "",
      firstName: "",
      email: "",
      gradeId: grades[0]?.id || "",
      departmentId: departments[0]?.id || "",
    });
    setSelectedTeacher(null);
    setFieldErrors({});
  };

  const handleCreate = async () => {
    const errors = validate(teacherSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await createUserMut.mutateAsync({ ...formData, role: "teacher", isActive: false });
      toast.success("Enseignant ajouté avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la création");
    }
  };

  const handleUpdate = async () => {
    if (!selectedTeacher) return;
    const errors = validate(teacherSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateUserMut.mutateAsync({
        id: selectedTeacher.id,
        data: { ...formData, role: "teacher" as const },
      });
      toast.success("Profil enseignant mis à jour");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la modification");
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (selectedTeacher) handleUpdate();
    else handleCreate();
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await deleteUserMut.mutateAsync(selectedTeacher.id);
      toast.success("Enseignant supprimé");
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: "lastName",
      header: "Nom",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.lastName}</div>
      ),
    },
    {
      accessorKey: "firstName",
      header: "Prénom",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.firstName}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "gradeId",
      header: "Grade",
      cell: ({ row }) => {
        const id = row.getValue("gradeId") as string;
        const name = grades.find((g) => g.id === id)?.name || id;
        return (
          <Badge variant="outline" className="bg-primary/5">
            {name}
          </Badge>
        );
      },
    },
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
      cell: ({ row }) => {
        const teacher = row.original;
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
                    setSelectedTeacher(teacher);
                    setFormData({
                      lastName: teacher.lastName,
                      firstName: teacher.firstName,
                      email: teacher.email,
                      gradeId: teacher.gradeId,
                      departmentId: teacher.departmentId,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedTeacher(teacher);
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
          <h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
          <p className="text-muted-foreground">Gestion du corps professoral.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog
            entity="teacher"
            triggerButtonText="Importation en masse"
            onSuccess={refetch}
          />
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nouvel Enseignant
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          filterColumn="lastName"
          filterPlaceholder="Rechercher par nom..."
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTeacher ? "Modifier" : "Ajouter"} Enseignant
            </DialogTitle>
            <DialogDescription>
              Informations professionnelles de l'enseignant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="grid grid-cols-2 gap-4 py-4">
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  error={fieldErrors?.lastName}
                />
              </Field>
              <Field>
                <FieldLabel>Prénom</FieldLabel>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  error={fieldErrors?.firstName}
                />
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  error={fieldErrors?.email}
                />
              </Field>
              <Field>
                <FieldLabel>Grade</FieldLabel>
                <Select
                  value={
                    grades.find((g) => g.id === formData.gradeId)?.name || ""
                  }
                  onValueChange={(name) => {
                    const grade = grades.find((g) => g.name === name);
                    setFormData({ ...formData, gradeId: grade?.id || "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.id} value={g.name}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors?.gradeId && <p className="text-sm font-medium text-destructive">{fieldErrors.gradeId}</p>}
              </Field>
              <Field>
                <FieldLabel>Département</FieldLabel>
                <Select
                  value={
                    departments.find((d) => d.id === formData.departmentId)
                      ?.name || ""
                  }
                  onValueChange={(name) => {
                    const dept = departments.find((d) => d.name === name);
                    setFormData({ ...formData, departmentId: dept?.id || "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors?.departmentId && <p className="text-sm font-medium text-destructive">{fieldErrors.departmentId}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" isLoading={selectedTeacher ? updateUserMut.isPending : createUserMut.isPending}>
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
              Supprimer l'enseignant {selectedTeacher?.lastName}{" "}
              {selectedTeacher?.firstName} ?
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
              isLoading={deleteUserMut.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
