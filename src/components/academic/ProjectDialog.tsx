import * as React from "react";
import { useMemo } from "react";

import { useTeachersList, useStudentsList, useCreateProject, useUpdateProject } from "@/hooks/use-queries";
import { useEntityForm } from "@/hooks/use-entity-form";
import { validate, projectSchema } from "@/lib/validations";
import type { Project } from "@/types";
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
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project?: Project | null;
}

const defaultForm = { title: "", description: "", supervisorId: "", studentIds: [] as string[] };

export function ProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: ProjectDialogProps) {
  const teachersQuery = useTeachersList();
  const studentsQuery = useStudentsList();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const teachers = teachersQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const isLoadingOptions = teachersQuery.isLoading || studentsQuery.isLoading;

  const form = useEntityForm(projectSchema, defaultForm);

  const [supervisorSearch, setSupervisorSearch] = React.useState("");

  const isEdit = !!project;

  const filteredSupervisors = useMemo(
    () => teachers
      .filter((teacher) =>
        getFullName(teacher).toLowerCase().includes(supervisorSearch.toLowerCase()),
      ),
    [teachers, supervisorSearch],
  );

  const studentOptions = useMemo(
    () => students.map((s) => ({
      value: s.id,
      label: getFullName(s),
    })),
    [students],
  );

  React.useEffect(() => {
    if (open) {
      if (project) {
        form.resetForm();
        form.setFormData({
          title: project.title,
          description: project.description || "",
          supervisorId: project.supervisorId,
          studentIds: project.studentIds,
        });
      } else {
        form.resetForm();
      }
      setSupervisorSearch("");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
              ? "Mettez à jour le sujet, l'encadrement et la composition du groupe."
              : "Ajoutez un sujet, son encadrant et le groupe d'étudiants associé."}
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
            <Label htmlFor={`${formId}-supervisor`}>Encadrant</Label>
            <Input
              placeholder="Rechercher un encadrant..."
              value={supervisorSearch}
              onChange={(e) => setSupervisorSearch(e.target.value)}
            />
            <Select
              value={form.formData.supervisorId}
              onValueChange={(val) => form.setFormData({ ...form.formData, supervisorId: val || "" })}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id={`${formId}-supervisor`} fullWidth>
                <SelectValue placeholder="Selectionner un encadrant" />
              </SelectTrigger>
              <SelectContent>
                {filteredSupervisors.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {form.fieldErrors?.supervisorId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.supervisorId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-students`}>Etudiants</Label>
            <MultiSelect
              options={studentOptions}
              value={form.formData.studentIds}
              onChange={(val) => form.setFormData({ ...form.formData, studentIds: val })}
              placeholder="Sélectionner des étudiants..."
              disabled={isLoadingOptions}
            />
            {form.fieldErrors?.studentIds && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.studentIds}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form={formId}
            isLoading={isEdit ? updateProjectMutation.isPending : createProjectMutation.isPending}
            disabled={isLoadingOptions}
          >
            {isEdit ? "Sauvegarder" : "Creer le projet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
