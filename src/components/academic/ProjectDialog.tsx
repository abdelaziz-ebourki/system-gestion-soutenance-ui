import * as React from "react";

import { useTeachersList, useCreateProject, useUpdateProject } from "@/hooks/use-queries";
import { useEntityForm } from "@/hooks/use-entity-form";
import { validate, projectSchema } from "@/lib/validations";
import type { DefenseType, Project } from "@/types";
import { DEFENSE_TYPE_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { getFullName, toastError } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue,
} from "@/components/ui";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project?: Project | null;
}

const defaultForm = { title: "", description: "", supervisorId: "", studentIds: [] as string[], defenseType: "pfe" as DefenseType };

export function ProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: ProjectDialogProps) {
  const teachersQuery = useTeachersList();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const teachers = teachersQuery.data ?? [];

  const form = useEntityForm(projectSchema, defaultForm);

  const isEdit = !!project;

  React.useEffect(() => {
    if (open) {
      if (project) {
        form.resetForm();
        form.setFormData({
          title: project.title,
          description: project.description || "",
          supervisorId: project.supervisorId,
          studentIds: project.studentIds,
          defenseType: project.defenseType,
        });
      } else {
        form.resetForm();
      }
    }
  }, [open]);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const errors = validate(projectSchema, form.formData);
    if (errors) {
      form.setFieldErrors(errors);
      return;
    }

    try {
      const supervisor = teachers.find(
        (teacher) => teacher.id === form.formData.supervisorId,
      );

      if (!supervisor) {
        toast.error("Encadrant introuvable");
        return;
      }

      if (isEdit && project) {
        await updateProjectMutation.mutateAsync({
          id: project.id,
          data: {
            ...form.formData,
            status: project.status,
          },
        });
        toast.success("Projet mis à jour");
      } else {
        await createProjectMutation.mutateAsync({
          ...form.formData,
        });
        toast.success("Projet créé avec succès");
      }

      form.setFieldErrors({});
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toastError(error, isEdit ? "Erreur lors de la mise à jour du projet" : "Erreur lors de la creation du projet");
    }
  };

  const formId = isEdit ? "edit-project-form" : "create-project-form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-160">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour le sujet et l'encadrement."
              : "Ajoutez un sujet et son encadrant."}
          </DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-title`}>Titre</Label>
            <Input
              id={`${formId}-title`}
              value={form.formData.title}
              onChange={(event) => form.setFormData({ ...form.formData, title: event.target.value })}
              required
              error={form.fieldErrors?.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-description`}>Description</Label>
            <Textarea
              id={`${formId}-description`}
              value={form.formData.description}
              onChange={(event) => form.setFormData({ ...form.formData, description: event.target.value })}
              className="min-h-28"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-defenseType`}>Type de soutenance</Label>
            <Select
              value={form.formData.defenseType}
              onValueChange={(val) => form.setFormData({ ...form.formData, defenseType: val as DefenseType })}
            >
              <SelectTrigger id={`${formId}-defenseType`} fullWidth>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFENSE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Encadrant</Label>
            <Combobox
              value={form.formData.supervisorId}
              onValueChange={(val) => form.setFormData({ ...form.formData, supervisorId: val || "" })}
            >
              <ComboboxInput placeholder="Rechercher un encadrant..." showTrigger>
                <ComboboxValue />
              </ComboboxInput>
              <ComboboxContent>
                <ComboboxList>
                  {teachers.map((teacher) => (
                    <ComboboxItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>Aucun encadrant trouvé</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {form.fieldErrors?.supervisorId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.supervisorId}</p>
            )}
          </div>

        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form={formId}
            isLoading={isEdit ? updateProjectMutation.isPending : createProjectMutation.isPending}
            disabled={teachersQuery.isLoading}
          >
            {isEdit ? "Sauvegarder" : "Creer le projet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
