import { useState, useMemo } from "react";
import { useProjects, useStudentGroups, useAssignProjectToGroup } from "@/hooks/use-queries";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
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
  const projects = projectsQuery.data ?? [];
  const groups = groupsQuery.data ?? [];
  const [selectedProjectId, setSelectedProjectId] = useState("");

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
      toastError(error, "Erreur lors de l'assignation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
            {availableProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun projet disponible. Créez d'abord un projet.
              </p>
            ) : (
              <Select value={selectedProjectId} onValueChange={(v) => setSelectedProjectId(v ?? "")}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!selectedProjectId} isLoading={assignMutation.isPending}>
              Assigner
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
