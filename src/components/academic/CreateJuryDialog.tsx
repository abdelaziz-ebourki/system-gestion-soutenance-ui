"use client";

import * as React from "react";

import { useTeachersList, useProjects, useCreateJury } from "@/hooks/use-queries";
import { validate, jurySchema } from "@/lib/validations";
import type { Teacher } from "@/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

interface CreateJuryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const getFullName = (teacher?: Teacher) =>
  teacher ? `${teacher.lastName} ${teacher.firstName}` : "";

export function CreateJuryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateJuryDialogProps) {
  const teachersQuery = useTeachersList();
  const projectsQuery = useProjects();
  const createJuryMutation = useCreateJury();
  const teachers = teachersQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const isLoadingOptions = teachersQuery.isLoading || projectsQuery.isLoading;

  const [projectId, setProjectId] = React.useState("");
  const [presidentId, setPresidentId] = React.useState("");
  const [reporterId, setReporterId] = React.useState("");
  const [examinerId, setExaminerId] = React.useState("");
  const [presidentSearch, setPresidentSearch] = React.useState("");
  const [reporterSearch, setReporterSearch] = React.useState("");
  const [examinerSearch, setExaminerSearch] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setProjectId("");
    setPresidentId("");
    setReporterId("");
    setExaminerId("");
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate(jurySchema, {
      projectId,
      presidentId,
      reporterId,
      examinerId,
    });

    if (errors) {
      setFieldErrors(errors);
      return;
    }

    try {
      const selectedProject = projects.find(
        (project) => project.id === projectId,
      );
      const president = teachers.find((teacher) => teacher.id === presidentId);
      const reporter = teachers.find((teacher) => teacher.id === reporterId);
      const examiner = teachers.find((teacher) => teacher.id === examinerId);

      await createJuryMutation.mutateAsync({
        projectId,
        projectTitle: selectedProject?.title || "",
        presidentId,
        presidentName: getFullName(president),
        reporterId,
        reporterName: getFullName(reporter),
        examinerId,
        examinerName: getFullName(examiner),
      });
      setFieldErrors({});
      toast.success("Jury cree avec succes");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la creation du jury";
      toast.error(message);
    }
  };

  const availableProjects = projects.filter(
    (project) => project.status !== "rejected",
  );

  const filteredPresidents = teachers
    .filter(
      (teacher) =>
        teacher.id !== reporterId && teacher.id !== examinerId,
    )
    .filter((teacher) =>
      getFullName(teacher).toLowerCase().includes(presidentSearch.toLowerCase()),
    );

  const filteredReporters = teachers
    .filter(
      (teacher) =>
        teacher.id !== presidentId && teacher.id !== examinerId,
    )
    .filter((teacher) =>
      getFullName(teacher).toLowerCase().includes(reporterSearch.toLowerCase()),
    );

  const filteredExaminers = teachers
    .filter(
      (teacher) =>
        teacher.id !== presidentId && teacher.id !== reporterId,
    )
    .filter((teacher) =>
      getFullName(teacher).toLowerCase().includes(examinerSearch.toLowerCase()),
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-155">
        <DialogHeader>
          <DialogTitle>Nouveau jury</DialogTitle>
          <DialogDescription>
            Associez un projet a trois enseignants avec des roles distincts.
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-jury-form"
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="jury-project">Projet</Label>
            <Select
              value={projectId}
              onValueChange={(val) => setProjectId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-project" fullWidth>
                <SelectValue placeholder="Selectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.projectId && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.projectId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-president">President</Label>
            <Input
              placeholder="Rechercher un president..."
              value={presidentSearch}
              onChange={(e) => setPresidentSearch(e.target.value)}
            />
            <Select
              value={presidentId}
              onValueChange={(val) => setPresidentId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-president" fullWidth>
                <SelectValue placeholder="Selectionner un president" />
              </SelectTrigger>
              <SelectContent>
                {filteredPresidents.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {getFullName(teacher)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.presidentId && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.presidentId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-reporter">Rapporteur</Label>
            <Input
              placeholder="Rechercher un rapporteur..."
              value={reporterSearch}
              onChange={(e) => setReporterSearch(e.target.value)}
            />
            <Select
              value={reporterId}
              onValueChange={(val) => setReporterId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-reporter" fullWidth>
                <SelectValue placeholder="Selectionner un rapporteur" />
              </SelectTrigger>
              <SelectContent>
                {filteredReporters.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {getFullName(teacher)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.reporterId && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.reporterId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-examiner">Examinateur</Label>
            <Input
              placeholder="Rechercher un examinateur..."
              value={examinerSearch}
              onChange={(e) => setExaminerSearch(e.target.value)}
            />
            <Select
              value={examinerId}
              onValueChange={(val) => setExaminerId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-examiner" fullWidth>
                <SelectValue placeholder="Selectionner un examinateur" />
              </SelectTrigger>
              <SelectContent>
                {filteredExaminers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {getFullName(teacher)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors?.examinerId && (
              <p className="text-sm font-medium text-destructive">{fieldErrors.examinerId}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-jury-form"
            isLoading={createJuryMutation.isPending}
            disabled={isLoadingOptions}
          >
            Creer le jury
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
