"use client";

import * as React from "react";

import { useTeachersList, useStudentsList, useCreateProject } from "@/hooks/use-queries";
import { validate, projectSchema } from "@/lib/validations";
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

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const getFullName = (user?: Teacher | Student) =>
  user ? `${user.lastName} ${user.firstName}` : "";

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  const teachersQuery = useTeachersList();
  const studentsQuery = useStudentsList();
  const createProjectMutation = useCreateProject();
  const teachers = teachersQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const isLoadingOptions = teachersQuery.isLoading || studentsQuery.isLoading;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [supervisorId, setSupervisorId] = React.useState("");
  const [studentIds, setStudentIds] = React.useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setTitle("");
    setDescription("");
    setSupervisorId("");
    setStudentIds([]);
  }, [open]);

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

      await createProjectMutation.mutateAsync({
        title,
        description,
        supervisorId,
        studentIds,
        studentNames: selectedStudents.map(getFullName),
        supervisorName: getFullName(supervisor),
        status: "pending",
      });
      setFieldErrors({});
      toast.success("Projet cree avec succes");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la creation du projet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-160">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Ajoutez un sujet, son encadrant et le groupe d'etudiants associe.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-project-form"
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="project-title">Titre</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              error={fieldErrors?.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-supervisor">Encadrant</Label>
            <Select
              value={supervisorId}
              onValueChange={(val) => setSupervisorId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="project-supervisor" fullWidth>
                <SelectValue placeholder="Selectionner un encadrant" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
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
            <Label htmlFor="project-students">Etudiants</Label>
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
            form="create-project-form"
            isLoading={createProjectMutation.isPending}
            disabled={isLoadingOptions}
          >
            Creer le projet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
