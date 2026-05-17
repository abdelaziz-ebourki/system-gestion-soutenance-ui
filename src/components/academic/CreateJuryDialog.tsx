"use client";

import * as React from "react";

import { createJury, getProjects, getTeachersList } from "@/lib/api";
import type { Project, Teacher } from "@/types";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitive";

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
  const [projectId, setProjectId] = React.useState("");
  const [presidentId, setPresidentId] = React.useState("");
  const [reporterId, setReporterId] = React.useState("");
  const [examinerId, setExaminerId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setProjectId("");
    setPresidentId("");
    setReporterId("");
    setExaminerId("");

    const fetchData = async () => {
      setIsLoadingOptions(true);
      try {
        const [teachersData, projectsData] = await Promise.all([
          getTeachersList(),
          getProjects(),
        ]);
        setTeachers(teachersData);
        setProjects(projectsData);
      } catch {
        toast.error("Erreur lors du chargement des donnees");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchData();
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!projectId || !presidentId || !reporterId || !examinerId) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }

    if (new Set([presidentId, reporterId, examinerId]).size < 3) {
      toast.error("Chaque role doit etre attribue a un enseignant different.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProject = projects.find(
        (project) => project.id === projectId,
      );
      const president = teachers.find((teacher) => teacher.id === presidentId);
      const reporter = teachers.find((teacher) => teacher.id === reporterId);
      const examiner = teachers.find((teacher) => teacher.id === examinerId);

      await createJury({
        projectId,
        projectTitle: selectedProject?.title || "",
        presidentId,
        presidentName: getFullName(president),
        reporterId,
        reporterName: getFullName(reporter),
        examinerId,
        examinerName: getFullName(examiner),
      });
      toast.success("Jury cree avec succes");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la creation du jury");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProjects = projects.filter(
    (project) => project.status !== "rejected",
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-president">President</Label>
            <Select
              value={presidentId}
              onValueChange={(val) => setPresidentId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-president" fullWidth>
                <SelectValue placeholder="Selectionner un president" />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id !== reporterId && teacher.id !== examinerId,
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-reporter">Rapporteur</Label>
            <Select
              value={reporterId}
              onValueChange={(val) => setReporterId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-reporter" fullWidth>
                <SelectValue placeholder="Selectionner un rapporteur" />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id !== presidentId && teacher.id !== examinerId,
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jury-examiner">Examinateur</Label>
            <Select
              value={examinerId}
              onValueChange={(val) => setExaminerId(val || "")}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="jury-examiner" fullWidth>
                <SelectValue placeholder="Selectionner un examinateur" />
              </SelectTrigger>
              <SelectContent>
                {teachers
                  .filter(
                    (teacher) =>
                      teacher.id !== presidentId && teacher.id !== reporterId,
                  )
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {getFullName(teacher)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-jury-form"
            isLoading={isSubmitting}
            disabled={isLoadingOptions}
          >
            Creer le jury
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
