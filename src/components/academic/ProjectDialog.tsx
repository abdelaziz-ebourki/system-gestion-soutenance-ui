import * as React from "react";

import { useTeachersList, useStudentsList, useCreateProject, useUpdateProject } from "@/hooks/use-queries";
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

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [supervisorId, setSupervisorId] = React.useState("");
  const [supervisorSearch, setSupervisorSearch] = React.useState("");
  const [studentIds, setStudentIds] = React.useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const isEdit = !!project;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setSupervisorId(project.supervisorId);
      setStudentIds(project.studentIds);
    } else {
      setTitle("");
      setDescription("");
      setSupervisorId("");
      setStudentIds([]);
    }
    setSupervisorSearch("");
    setFieldErrors({});
  }, [open, project]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate(projectSchema, {
      title,
      description,
      supervisorId,
      studentIds,
    });

    if (errors) {
      setFieldErrors(errors);
      return;
    }

    try {
      const supervisor = teachers.find(
        (teacher) => teacher.id === supervisorId,
      );
      const selectedStudents = students.filter((student) =>
        studentIds.includes(student.id),
      );

      if (isEdit && project) {
        await updateProjectMutation.mutateAsync({
          id: project.id,
          data: {
            title,
            description,
            supervisorId,
            studentIds,
            studentNames: selectedStudents.map(getFullName),
            supervisorName: getFullName(supervisor),
            status: project.status,
          },
        });
        toast.success("Projet mis a jour");
      } else {
        await createProjectMutation.mutateAsync({
          title,
          description,
          supervisorId,
          studentIds,
          studentNames: selectedStudents.map(getFullName),
          supervisorName: getFullName(supervisor),
          status: "pending",
        });
        toast.success("Projet cree avec succes");
      }

      setFieldErrors({});
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toastError(error, isEdit ? "Erreur lors de la mise a jour du projet" : "Erreur lors de la creation du projet");
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
              ? "Mettez a jour le sujet, l'encadrement et la composition du groupe."
              : "Ajoutez un sujet, son encadrant et le groupe d'etudiants associe."}
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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              error={fieldErrors?.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-description`}>Description</Label>
            <Textarea
              id={`${formId}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
              value={supervisorId}
              onValueChange={(val) => setSupervisorId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id={`${formId}-supervisor`} fullWidth>
                <SelectValue placeholder="Selectionner un encadrant" />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter((teacher) =>
                    getFullName(teacher).toLowerCase().includes(supervisorSearch.toLowerCase()),
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fieldErrors?.supervisorId && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.supervisorId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${formId}-students`}>Etudiants</Label>
            <MultiSelect
              options={students.map((s) => ({
                value: s.id,
                label: getFullName(s),
              }))}
              value={studentIds}
              onChange={setStudentIds}
              placeholder="Sélectionner des étudiants..."
              disabled={isLoadingOptions}
            />
            {fieldErrors?.studentIds && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.studentIds}</p>
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
