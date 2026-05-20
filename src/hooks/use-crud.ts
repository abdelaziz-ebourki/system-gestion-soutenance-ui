import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { validate } from "@/lib/validations";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";

interface CrudConfig<TForm, TEntity extends { id: string }> {
  schema: z.ZodType<TForm>;
  defaultForm: TForm;
  onCreate: (data: TForm) => Promise<unknown>;
  onUpdate: (id: string, data: TForm) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  entityName: (entity: TEntity) => string;
  mapToForm: (entity: TEntity) => TForm;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

interface CrudResult<TForm, TEntity extends { id: string }> {
  formData: TForm;
  setFormData: React.Dispatch<React.SetStateAction<TForm>>;
  fieldErrors: Partial<Record<keyof TForm, string>>;
  selected: TEntity | null;
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  openCreate: () => void;
  openEdit: (entity: TEntity) => void;
  openDelete: (entity: TEntity) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function useCrud<TForm, TEntity extends { id: string }>(
  config: CrudConfig<TForm, TEntity>,
): CrudResult<TForm, TEntity> {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<TEntity | null>(null);
  const [formData, setFormData] = useState<TForm>(config.defaultForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TForm, string>>>({});

  const {
    schema,
    onCreate,
    onUpdate,
    onDelete,
    entityName,
    mapToForm,
    successMessages = {
      create: "Créé avec succès",
      update: "Modifié avec succès",
      delete: "Supprimé avec succès",
    },
  } = config;
  void entityName;

  const openCreate = () => {
    setFormData(config.defaultForm);
    setSelected(null);
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const openEdit = (entity: TEntity) => {
    setFormData(mapToForm(entity));
    setSelected(entity);
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const openDelete = (entity: TEntity) => {
    setSelected(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validate(schema, formData);
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    try {
      if (selected) {
        await onUpdate(selected.id, formData);
        toast.success(successMessages.update ?? "Modifié avec succès");
      } else {
        await onCreate(formData);
        toast.success(successMessages.create ?? "Créé avec succès");
      }
      setIsDialogOpen(false);
      setFormData(config.defaultForm);
      setSelected(null);
    } catch (error) {
      toastError(
        error,
        selected
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await onDelete(selected.id);
      toast.success(successMessages.delete ?? "Supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setSelected(null);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  return {
    formData,
    setFormData,
    fieldErrors,
    selected,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    openCreate,
    openEdit,
    openDelete,
    handleSubmit,
    handleDelete,
  };
}
