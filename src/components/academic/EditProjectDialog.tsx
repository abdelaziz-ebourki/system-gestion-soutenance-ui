"use client";

import * as React from "react";

import { useTeachersList, useStudentsList, useUpdateProject } from "@/hooks/use-queries";
import { validate, projectSchema } from "@/lib/validations";
import type { Project, Teacher, Student } from "@/types";
import { toast } from "sonner";
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

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project: Project | null;
}

const getFullName = (user?: Teacher | Student) =>
  user ? `${user.lastName} ${user.firstName}` : "";

export function EditProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: EditProjectDialogProps) {
  const teachersQuery = useTeachersList();
  const studentsQuery = useStudentsList();
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

  React.useEffect(() => {
    if (!open || !project) {
      return;
    }

    setTitle(project.title);
    setDescription(project.description || "");
    setSupervisorId(project.supervisorId);
    setStudentIds(project.studentIds);
  }, [open, project]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!project) {
      return;
    }

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
      setFieldErrors({});
      toast.success("Projet mis a jour");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise a jour du projet";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-160">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Mettez a jour le sujet, l'encadrement et la composition du groupe.
          </DialogDescription>
        </DialogHeader>
        <form
          id="edit-project-form"
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="edit-project-title">Titre</Label>
            <Input
              id="edit-project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              error={fieldErrors?.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <Textarea
              id="edit-project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-project-supervisor">Encadrant</Label>
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
              <SelectTrigger id="edit-project-supervisor" fullWidth>
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
            <Label htmlFor="edit-project-students">Etudiants</Label>
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
            form="edit-project-form"
            isLoading={updateProjectMutation.isPending}
            disabled={isLoadingOptions}
          >
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
