import { useState, useMemo, useEffect } from "react";
import { useProjects, useStudentGroups, useAssignProjectToGroup } from "@/hooks/queries";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { StudentGroupAssignment } from "@/lib/api-coordinator";

interface AssignProjectDialogProps {
  group: StudentGroupAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignProjectDialog({
  group,
  open,
  onOpenChange,
}: AssignProjectDialogProps) {
  const projectsQuery = useProjects();
  const groupsQuery = useStudentGroups();
  const assignMutation = useAssignProjectToGroup();
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedProjectId("");
    }
  }, [open]);

  const assignedProjectIds = useMemo(
    () => new Set(
      groups.filter((g) => g.projectId).map((g) => g.projectId as string),
    ),
    [groups],
  );

  const availableProjects = useMemo(
    () => projects.filter((p) => !assignedProjectIds.has(p.id)),
    [projects, assignedProjectIds],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !group) return;
    try {
      await assignMutation.mutateAsync({ projectId: selectedProjectId, groupId: group.id });
      toast.success(`Projet assigné au groupe "${group.groupName}"`);
      setSelectedProjectId("");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de l'assignation"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="coord-assign-project-dialog">
        <DialogHeader>
          <DialogTitle>Assigner un projet</DialogTitle>
          <DialogDescription>
            Groupe : <strong>{group?.groupName}</strong>
            {group?.memberNames && (
              <span className="block text-xs text-muted-foreground mt-1">
                {group.memberNames.join(", ")}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {projectsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : availableProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun projet disponible. Créez d'abord un projet.
              </p>
            ) : (
              <Select value={selectedProjectId} onValueChange={(v) => setSelectedProjectId(v ?? "")} data-testid="coord-assign-project-select">
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un projet" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="coord-assign-project-cancel">
              Annuler
            </Button>
            <Button type="submit" disabled={!selectedProjectId} isLoading={assignMutation.isPending} data-testid="coord-assign-project-submit">
              Assigner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

