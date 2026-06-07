import { useState, type ReactNode } from "react";
import { validate, configNameSchema } from "@/lib/validations";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ConfigCard } from "./ConfigCard";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import type { UseMutationResult } from "@tanstack/react-query";

interface ConfigEntityManagerProps {
  title: string;
  description: string;
  icon: ReactNode;
  entityLabel: string;
  entityLabelPlural: string;
  data: { id: string; name: string }[] | undefined;
  createMut: UseMutationResult<unknown, Error, { name: string }, unknown>;
  updateMut: UseMutationResult<unknown, Error, { id: string; data: { name: string } }, unknown>;
  deleteMut: UseMutationResult<unknown, Error, string, unknown>;
}

export function ConfigEntityManager({
  title,
  description,
  icon,
  entityLabel,
  entityLabelPlural,
  data,
  createMut,
  updateMut,
  deleteMut,
}: ConfigEntityManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const isSubmitting = selectedItem ? updateMut.isPending : createMut.isPending;

  const handleOpenDialog = (item: { id: string; name: string } | null = null) => {
    setSelectedItem(item);
    setFormData({ name: item?.name || "" });
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errors = validate(configNameSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      if (selectedItem) {
        await updateMut.mutateAsync({ id: selectedItem.id, data: formData });
        toast.success("Modifié avec succès");
      } else {
        await createMut.mutateAsync(formData);
        toast.success("Ajouté avec succès");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Une erreur est survenue"));
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteMut.mutateAsync(selectedItem.id);
      toast.success("Supprimé avec succès");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la suppression"));
    }
  };

  return (
    <>
      <ConfigCard
        title={title}
        description={description}
        icon={icon}
        items={data ?? []}
        onAdd={() => handleOpenDialog(null)}
        onEdit={(item) => handleOpenDialog(item)}
        onDelete={(item) => {
          setSelectedItem(item);
          setIsDeleteDialogOpen(true);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter"} {entityLabel}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            {selectedItem ? `Modifier les informations de ${entityLabel}` : `Ajouter un nouveau ${entityLabel}`}
          </DialogDescription>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Nom / Libellé</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  error={fieldErrors?.name}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" isLoading={isSubmitting} loadingText="Enregistrement...">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        entityName={selectedItem?.name ? `"${selectedItem.name}"` : undefined}
        description={selectedItem?.name ? `Supprimer ${entityLabel.toLowerCase()} "${selectedItem.name}" ? Cela pourrait affecter les ${entityLabelPlural.toLowerCase()} liés.` : undefined}
        isPending={deleteMut.isPending}
      />
    </>
  );
}
