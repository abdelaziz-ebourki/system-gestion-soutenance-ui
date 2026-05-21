import { useState } from "react";
import { Layers } from "lucide-react";
import {
  useLevels, useCreateLevel, useUpdateLevel, useDeleteLevel,
} from "@/hooks/use-queries";
import { validate, configNameSchema } from "@/lib/validations";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ConfigCard } from "./ConfigCard";

export function LevelManager() {
  const { data: levels } = useLevels();
  const createMut = useCreateLevel();
  const updateMut = useUpdateLevel();
  const deleteMut = useDeleteLevel();

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      toastError(error, "Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteMut.mutateAsync(selectedItem.id);
      toast.success("Supprimé avec succès");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toastError(error, "Erreur lors de la suppression");
    }
  };

  return (
    <>
      <ConfigCard
        title="Niveaux"
        description="Cycles universitaires."
        icon={<Layers className="size-5" />}
        items={levels ?? []}
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
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter"} Niveau</DialogTitle>
          </DialogHeader>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer ce niveau ? Cela pourrait affecter les étudiants liés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive"
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
