import * as React from "react";

import { useTeachersList, useStudents, useCreateProject, useUpdateProject } from "@/hooks/use-queries";
import { useEntityForm } from "@/hooks/use-entity-form";
import { validate, projectSchema } from "@/lib/validations";
import type { DefenseType, Project } from "@/types";
import { DEFENSE_TYPE_OPTIONS, MAX_STUDENT_FETCH_LIMIT } from "@/lib/constants";
import { toast } from "sonner";
import { getFullName, getErrorMessage } from "@/lib/utils";
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
  MultiSelect,
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
  const studentsQuery = useStudents({ limit: MAX_STUDENT_FETCH_LIMIT });
  const studentOptions = React.useMemo(() => 
    (studentsQuery.data?.items ?? []).map((s) => ({
      value: String(s.id),
      label: getFullName(s),
    })),
    [studentsQuery.data?.items],
  );

  const form = useEntityForm(projectSchema, defaultForm);

  const isEdit = !!project;
  const formRef = React.useRef(form);
  formRef.current = form; // eslint-disable-line react-hooks/refs

  React.useEffect(() => {
    if (open) {
      const f = formRef.current;
      if (project) {
        f.resetForm();
        f.setFormData({
          title: project.title,
          description: project.description || "",
          supervisorId: "",
          studentIds: [],
          defenseType: project.defenseType as DefenseType,
        });
      } else {
        f.resetForm();
      }
    }
  }, [open, project, formRef]);

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const errors = validate(projectSchema, form.formData);
    if (errors) {
      form.setFieldErrors(errors);
      return;
    }

    try {
      const supervisor = teachers.find(
        (teacher) => String(teacher.id) === form.formData.supervisorId,
      );

      if (!supervisor) {
        toast.error("Encadrant introuvable");
        return;
      }

      if (isEdit && project) {
        await updateProjectMutation.mutateAsync({
          id: project.id,
          data: {
            title: form.formData.title,
            description: form.formData.description ?? "",
            defenseType: form.formData.defenseType,
          },
        });
        toast.success("Projet mis à jour");
      } else {
        await createProjectMutation.mutateAsync({
          title: form.formData.title,
          description: form.formData.description ?? "",
          supervisorId: Number(form.formData.supervisorId),
          defenseType: form.formData.defenseType,
          studentIds: form.formData.studentIds.map(Number),
        });
        toast.success("Projet créé avec succès");
      }

      form.setFieldErrors({});
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, isEdit ? "Erreur lors de la mise à jour du projet" : "Erreur lors de la creation du projet"));
    }
  };

  const formId = isEdit ? "edit-project-form" : "create-project-form";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-160" data-testid="coord-project-dialog">
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
           data-testid="coord-project-dialog-form"
         >
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-title`}>Titre</Label>
            <Input
              id={`${formId}-title`}
              value={form.formData.title}
              onChange={(event) => form.setFormData({ ...form.formData, title: event.target.value })}
              required
              error={form.fieldErrors?.title}
              data-testid="coord-project-dialog-title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-description`}>Description</Label>
            <Textarea
              id={`${formId}-description`}
              value={form.formData.description}
              onChange={(event) => form.setFormData({ ...form.formData, description: event.target.value })}
              className="min-h-28"
              data-testid="coord-project-dialog-description"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-defenseType`}>Type de soutenance</Label>
            <Select
              value={form.formData.defenseType}
              onValueChange={(val) => form.setFormData({ ...form.formData, defenseType: val as DefenseType })}
            >
              <SelectTrigger id={`${formId}-defenseType`} fullWidth data-testid="coord-project-dialog-defense-type">
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
              data-testid="coord-project-dialog-supervisor"
            >
              <ComboboxInput placeholder="Rechercher un encadrant..." showTrigger>
                <ComboboxValue />
              </ComboboxInput>
              <ComboboxContent>
                <ComboboxList>
                  {teachers.map((teacher) => (
                    <ComboboxItem key={teacher.id} value={String(teacher.id)}>
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

          <div className="grid gap-2">
            <Label>Étudiants</Label>
            <MultiSelect
              options={studentOptions}
              value={form.formData.studentIds}
              onChange={(ids) => form.setFormData({ ...form.formData, studentIds: ids })}
              placeholder="Sélectionner des étudiants..."
              disabled={studentsQuery.isLoading}
              data-testid="coord-project-dialog-students"
            />
            {form.fieldErrors?.studentIds && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.studentIds}</p>
            )}
          </div>

        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="coord-project-dialog-cancel"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form={formId}
            isLoading={isEdit ? updateProjectMutation.isPending : createProjectMutation.isPending}
            disabled={teachersQuery.isLoading}
            data-testid="coord-project-dialog-submit"
          >
            {isEdit ? "Sauvegarder" : "Créer le projet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
