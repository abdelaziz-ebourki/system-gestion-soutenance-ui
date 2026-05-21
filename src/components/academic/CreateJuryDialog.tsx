import * as React from "react";
import { useMemo } from "react";

import { useTeachersList, useProjects, useCreateJury } from "@/hooks/use-queries";
import { useEntityForm } from "@/hooks/use-entity-form";
import { validate, jurySchema } from "@/lib/validations";
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
} from "@/components/ui";

interface CreateJuryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const defaultForm = { projectId: "", presidentId: "", reporterId: "", examinerId: "" };

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

  const form = useEntityForm(jurySchema, defaultForm);

  const [presidentSearch, setPresidentSearch] = React.useState("");
  const [reporterSearch, setReporterSearch] = React.useState("");
  const [examinerSearch, setExaminerSearch] = React.useState("");

  React.useEffect(() => {
    if (open) {
      form.resetForm();
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validate(jurySchema, form.formData);
    if (errors) {
      form.setFieldErrors(errors);
      return;
    }

    try {
      const { projectId, presidentId, reporterId, examinerId } = form.formData;
      const president = teachers.find((teacher) => teacher.id === presidentId);
      const reporter = teachers.find((teacher) => teacher.id === reporterId);
      const examiner = teachers.find((teacher) => teacher.id === examinerId);

      if (!president || !reporter || !examiner) {
        toast.error("Un ou plusieurs membres du jury sont introuvables");
        return;
      }

      await createJuryMutation.mutateAsync({
        projectId,
        presidentId,
        reporterId,
        examinerId,
      });
      form.setFieldErrors({});
      toast.success("Jury créé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toastError(error, "Erreur lors de la creation du jury");
    }
  };

  const availableProjects = useMemo(
    () => projects.filter((project) => project.status !== "rejected"),
    [projects],
  );

  const filteredPresidents = useMemo(
    () => teachers
      .filter(
        (teacher) =>
          teacher.id !== form.formData.reporterId && teacher.id !== form.formData.examinerId,
      )
      .filter((teacher) =>
        getFullName(teacher).toLowerCase().includes(presidentSearch.toLowerCase()),
      ),
    [teachers, form.formData.reporterId, form.formData.examinerId, presidentSearch],
  );

  const filteredReporters = useMemo(
    () => teachers
      .filter(
        (teacher) =>
          teacher.id !== form.formData.presidentId && teacher.id !== form.formData.examinerId,
      )
      .filter((teacher) =>
        getFullName(teacher).toLowerCase().includes(reporterSearch.toLowerCase()),
      ),
    [teachers, form.formData.presidentId, form.formData.examinerId, reporterSearch],
  );

  const filteredExaminers = useMemo(
    () => teachers
      .filter(
        (teacher) =>
          teacher.id !== form.formData.presidentId && teacher.id !== form.formData.reporterId,
      )
      .filter((teacher) =>
        getFullName(teacher).toLowerCase().includes(examinerSearch.toLowerCase()),
      ),
    [teachers, form.formData.presidentId, form.formData.reporterId, examinerSearch],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-155">
        <DialogHeader>
          <DialogTitle>Nouveau jury</DialogTitle>
          <DialogDescription>
            Associez un projet à trois enseignants avec des rôles distincts.
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
              value={form.formData.projectId}
              onValueChange={(val) => form.setFormData({ ...form.formData, projectId: val || "" })}
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
            {form.fieldErrors?.projectId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.projectId}</p>
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
              value={form.formData.presidentId}
              onValueChange={(val) => form.setFormData({ ...form.formData, presidentId: val || "" })}
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
            {form.fieldErrors?.presidentId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.presidentId}</p>
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
              value={form.formData.reporterId}
              onValueChange={(val) => form.setFormData({ ...form.formData, reporterId: val || "" })}
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
            {form.fieldErrors?.reporterId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.reporterId}</p>
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
              value={form.formData.examinerId}
              onValueChange={(val) => form.setFormData({ ...form.formData, examinerId: val || "" })}
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
            {form.fieldErrors?.examinerId && (
              <p className="text-sm font-medium text-destructive">{form.fieldErrors.examinerId}</p>
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
