
import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  useStudents, useFilieres, useLevels,
  useCreateUser, useUpdateUser, useDeleteUser,
} from "@/hooks/use-queries";
import { type Student } from "@/types";
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
import { validate, studentSchema } from "@/lib/validations";
import { toastError } from "@/lib/utils";

export default function Students() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: studentsData, isLoading, refetch } = useStudents(pagination.pageIndex, pagination.pageSize);
  const { data: filieres = [] } = useFilieres();
  const { data: levels = [] } = useLevels();
  const createUserMut = useCreateUser();
  const updateUserMut = useUpdateUser();
  const deleteUserMut = useDeleteUser();

  const data = studentsData?.items ?? [];
  const pageCount = studentsData?.pageCount ?? 0;

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(
    null,
  );

  // Form state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState({
    lastName: "",
    firstName: "",
    email: "",
    cne: "",
    filiereId: "",
    levelId: "",
  });

  const resetForm = () => {
    setFormData({
      lastName: "",
      firstName: "",
      email: "",
      cne: "",
      filiereId: filieres?.[0]?.id || "",
      levelId: levels?.[0]?.id || "",
    });
    setSelectedStudent(null);
    setFieldErrors({});
  };

  const handleCreate = async () => {
    const errors = validate(studentSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await createUserMut.mutateAsync({ ...formData, role: "student", isActive: false });
      toast.success("Étudiant créé avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la création de l'étudiant");
    }
  };

  const handleUpdate = async () => {
    if (!selectedStudent) return;
    const errors = validate(studentSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateUserMut.mutateAsync({
        id: selectedStudent.id,
        data: { ...formData, role: "student" as const },
      });
      toast.success("Étudiant modifié avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toastError(error, "Erreur lors de la modification de l'étudiant");
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (selectedStudent) handleUpdate();
    else handleCreate();
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await deleteUserMut.mutateAsync(selectedStudent.id);
      toast.success("Étudiant supprimé");
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "cne",
      header: "CNE",
      cell: ({ row }) => (
        <code className="font-bold">{row.getValue("cne")}</code>
      ),
    },
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
      cell: ({ row }) => {
        const student = row.original;
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
                    setSelectedStudent(student);
                    setFormData({
                      lastName: student.lastName,
                      firstName: student.firstName,
                      email: student.email,
                      cne: student.cne,
                      filiereId: student.filiereId,
                      levelId: student.levelId,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedStudent(student);
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
          <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground">
            Gestion des inscriptions et profils étudiants.
          </p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog
            entity="student"
            triggerButtonText="Importation en masse"
            onSuccess={refetch}
          />
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nouvel Étudiant
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
              {selectedStudent ? "Modifier" : "Ajouter"} Étudiant
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations académiques de l'étudiant.
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
                <FieldLabel>CNE</FieldLabel>
                <Input
                  value={formData.cne}
                  onChange={(e) =>
                    setFormData({ ...formData, cne: e.target.value })
                  }
                  required
                  error={fieldErrors?.cne}
                />
              </Field>
              <Field>
                <FieldLabel>Niveau</FieldLabel>
                <Select
                  value={
                    levels.find((l) => l.id === formData.levelId)?.name || ""
                  }
                  onValueChange={(name) => {
                    const level = levels.find((l) => l.name === name);
                    setFormData({ ...formData, levelId: level?.id || "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((n) => (
                      <SelectItem key={n.id} value={n.name}>
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors?.levelId && <p className="text-sm font-medium text-destructive">{fieldErrors.levelId}</p>}
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Filière</FieldLabel>
                <Select
                  value={
                    filieres.find((f) => f.id === formData.filiereId)?.name ||
                    ""
                  }
                  onValueChange={(name) => {
                    const filiere = filieres.find((f) => f.name === name);
                    setFormData({ ...formData, filiereId: filiere?.id || "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une filière" />
                  </SelectTrigger>
                  <SelectContent>
                    {filieres.map((f) => (
                      <SelectItem key={f.id} value={f.name}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors?.filiereId && <p className="text-sm font-medium text-destructive">{fieldErrors.filiereId}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                isLoading={selectedStudent ? updateUserMut.isPending : createUserMut.isPending}
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
              Supprimer l'étudiant {selectedStudent?.lastName}{" "}
              {selectedStudent?.firstName} ?
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
