import { useState } from "react";
import { GraduationCap } from "lucide-react";
import {
  useFaculties, useCreateFaculty, useUpdateFaculty, useDeleteFaculty,
} from "@/hooks/use-queries";
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

export function FacultyManager() {
  const { data: faculties } = useFaculties();
  const createMut = useCreateFaculty();
  const updateMut = useUpdateFaculty();
  const deleteMut = useDeleteFaculty();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; code: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const isSubmitting = selectedItem ? updateMut.isPending : createMut.isPending;

  const handleOpenDialog = (item: { id: string; name: string; code: string } | null = null) => {
    setSelectedItem(item);
    setFormData({ name: item?.name || "", code: item?.code || "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;
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
        title="Facultés"
        description="Gérez les facultés / écoles de l'établissement."
        icon={<GraduationCap className="size-5" />}
        items={faculties ?? []}
        onAdd={() => handleOpenDialog(null)}
        onEdit={(item) => handleOpenDialog(item as { id: string; name: string; code: string })}
        onDelete={(item) => {
          setSelectedItem(item as { id: string; name: string; code: string });
          setIsDeleteDialogOpen(true);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Modifier" : "Ajouter"} Faculté</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Nom / Libellé</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Code</FieldLabel>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="FSBM"
                  required
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
              Supprimer cette faculté ? Cela pourrait affecter les départements liés.
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