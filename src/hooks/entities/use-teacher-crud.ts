import { useState } from "react";
import { useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-queries";
import { teacherSchema } from "@/lib/validations";
import { useEntityForm } from "@/hooks/use-entity-form";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import type { Teacher } from "@/types";

type TeacherFormData = {
  lastName: string;
  firstName: string;
  email: string;
  departmentId: string;
};

const defaultForm: TeacherFormData = {
  lastName: "", firstName: "", email: "", departmentId: "",
};

export function useTeacherCrud() {
  const form = useEntityForm(teacherSchema, defaultForm);
  const create = useCreateUser();
  const update = useUpdateUser();
  const del = useDeleteUser();

  const [selected, setSelected] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openCreate = () => {
    form.resetForm();
    setSelected(null);
    setIsDialogOpen(true);
  };

  const openEdit = (entity: Teacher) => {
    form.setFormData({
      lastName: entity.lastName,
      firstName: entity.firstName,
      email: entity.email,
      departmentId: entity.departmentId,
    });
    setSelected(entity);
    setIsDialogOpen(true);
  };

  const openDelete = (entity: Teacher) => {
    setSelected(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.validateForm()) return;
    try {
      if (selected) {
        await update.mutateAsync({ id: selected.id, data: { ...form.formData, role: "teacher" as const } });
        toast.success("Enseignant modifié avec succès");
      } else {
        await create.mutateAsync({ ...form.formData, role: "teacher", isActive: false });
        toast.success("Enseignant créé avec succès");
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
      toast.success("Enseignant supprimé");
      setIsDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const updateMutation = (id: string, data: Partial<TeacherFormData> & { role: "teacher" }) =>
    update.mutateAsync({ id, data });

  const deleteMutation = (id: string) => del.mutateAsync(id);

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
    updateMutation,
    deleteMutation,
    isCreatePending: create.isPending,
    isUpdatePending: update.isPending,
    isDeletePending: del.isPending,
    isPending: create.isPending || update.isPending || del.isPending,
  };
}
