import { useState } from "react";
import { useCreateSession, useUpdateSession, useDeleteSession } from "@/hooks/use-queries";
import { sessionSchema } from "@/lib/validations";
import { useEntityForm } from "@/hooks/use-entity-form";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import type { Session } from "@/types";

type SessionForm = {
  name: string;
  type: string;
  status: "active" | "draft" | "archived";
  startDate: string;
  endDate: string;
};

const defaultForm: SessionForm = {
  name: "", type: "Normale", status: "draft", startDate: "", endDate: "",
};

export function useSessionCrud() {
  const form = useEntityForm(sessionSchema, defaultForm);
  const create = useCreateSession();
  const update = useUpdateSession();
  const del = useDeleteSession();

  const [selected, setSelected] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openCreate = () => {
    form.resetForm();
    setSelected(null);
    setIsDialogOpen(true);
  };

  const openEdit = (entity: Session) => {
    form.setFormData({
      name: entity.name,
      type: entity.type,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
    });
    setSelected(entity);
    setIsDialogOpen(true);
  };

  const openDelete = (entity: Session) => {
    setSelected(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.validateForm()) return;
    try {
      if (selected) {
        await update.mutateAsync({ id: selected.id, data: form.formData });
        toast.success("Session modifiée avec succès");
      } else {
        await create.mutateAsync(form.formData);
        toast.success("Session créée avec succès");
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
      toast.success("Session supprimée");
      setIsDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  const updateMutation = (id: string, data: Partial<Parameters<typeof update.mutateAsync>[0]["data"]>) =>
    update.mutateAsync({ id, data: data as Parameters<typeof update.mutateAsync>[0]["data"] });

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
    isPending: create.isPending || update.isPending || del.isPending,
  };
}
