import { useState } from "react";
import { useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-queries";
import { studentSchema } from "@/lib/validations";
import { useEntityForm } from "@/hooks/use-entity-form";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import type { Student } from "@/types";

export type StudentFormData = {
  lastName: string;
  firstName: string;
  email: string;
  cne: string;
  majorId: string;
  levelId: string;
};

const defaultForm: StudentFormData = {
  lastName: "", firstName: "", email: "", cne: "", majorId: "", levelId: "",
};

export function useStudentCrud() {
  const form = useEntityForm(studentSchema, defaultForm);
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const [selected, setSelected] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openCreate = () => {
    form.resetForm();
    setSelected(null);
    setIsDialogOpen(true);
  };

  const openEdit = (entity: Student) => {
    form.setFormData({
      lastName: entity.lastName,
      firstName: entity.firstName,
      email: entity.email,
      cne: entity.cne,
      majorId: entity.majorId,
      levelId: entity.levelId,
    });
    setSelected(entity);
    setIsDialogOpen(true);
  };

  const openDelete = (entity: Student) => {
    setSelected(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.validateForm()) return;
    try {
      if (selected) {
        await update.mutateAsync({ id: selected.id, data: { ...form.formData, role: "student" as const } });
        toast.success("Étudiant modifié avec succès");
      } else {
        await create.mutateAsync({ ...form.formData, role: "student", isActive: false });
        toast.success("Étudiant créé avec succès");
      }
      setIsDialogOpen(false);
      form.resetForm();
      setSelected(null);
    } catch (error) {
      toastError(error, selected ? "Erreur lors de la modification" : "Erreur lors de la création");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await del.mutateAsync(selected.id);
      toast.success("Étudiant supprimé");
      setIsDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const updateMutation = (id: string, data: Partial<StudentFormData> & { role: "student" }) =>
    update.mutateAsync({ id, data });

  const deleteMutation = (id: string) => del.mutateAsync(id);

  const handleClose = () => setIsDialogOpen(false);
  const handleCloseDelete = () => setIsDeleteDialogOpen(false);

  return {
    ...form,
    selected,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openCreate,
    openEdit,
    openDelete,
    handleSubmit,
    handleDelete,
    handleClose,
    handleCloseDelete,
    updateMutation,
    deleteMutation,
    isCreatePending: create.isPending,
    isUpdatePending: update.isPending,
    isDeletePending: del.isPending,
    isPending: create.isPending || update.isPending || del.isPending,
  };
}
