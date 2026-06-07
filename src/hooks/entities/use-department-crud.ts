import { useState } from "react";
import { useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/use-queries";
import { departmentSchema } from "@/lib/validations";
import { useEntityForm } from "@/hooks/use-entity-form";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type { Department } from "@/types";

type DepartmentForm = {
  name: string;
  code: string;
  headId: string;
};

const defaultForm: DepartmentForm = {
  name: "", code: "", headId: "",
};

export function useDepartmentCrud() {
  const form = useEntityForm(departmentSchema, defaultForm);
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const del = useDeleteDepartment();

  const [selected, setSelected] = useState<Department | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openCreate = () => {
    form.resetForm();
    setSelected(null);
    setIsDialogOpen(true);
  };

  const openEdit = (entity: Department) => {
    form.setFormData({
      name: entity.name,
      code: entity.code,
      headId: entity.headId ?? "",
    });
    setSelected(entity);
    setIsDialogOpen(true);
  };

  const openDelete = (entity: Department) => {
    setSelected(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.validateForm()) return;
    try {
      if (selected) {
        await update.mutateAsync({ id: selected.id, data: form.formData });
        toast.success("Département mis à jour avec succès");
      } else {
        await create.mutateAsync(form.formData);
        toast.success("Département ajouté avec succès");
      }
      setIsDialogOpen(false);
      form.resetForm();
      setSelected(null);
    } catch (error) {
      toast.error(getErrorMessage(error, selected ? "Erreur lors de la modification" : "Erreur lors de la création"));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await del.mutateAsync(selected.id);
      toast.success("Département supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la suppression"));
    }
  };

  const updateMutation = (id: string, data: Parameters<typeof update.mutateAsync>[0]["data"]) =>
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
