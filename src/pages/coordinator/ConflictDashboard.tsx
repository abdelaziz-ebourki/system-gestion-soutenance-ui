import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock, Users, DoorOpen, UserX } from "lucide-react";

import { useProjects, useRooms, useJuries, useGroups, useCoordinatorDefenseSessions, useDefenseSchedule, useCoordinatorUnavailability } from "@/hooks/use-queries";
import { getAllConflicts } from "@/lib/conflict-engine";
import type { ConflictIssue } from "@/lib/conflict-engine";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from "@/components/ui";

const conflictIcons: Record<string, typeof AlertTriangle> = {
  room_capacity: DoorOpen,
  teacher_double_booked: Users,
  student_double_booked: Users,
  supervisor_conflict: UserX,
  break_violation: Clock,
  out_of_bounds: AlertTriangle,
  slot_occupied: AlertTriangle,
  project_already_scheduled: AlertTriangle,
  teacher_unavailable: UserX,
};

const conflictLabels: Record<string, string> = {
  room_capacity: "Capacité de salle",
  teacher_double_booked: "Conflit enseignant",
  student_double_booked: "Conflit étudiant",
  supervisor_conflict: "Conflit encadrant",
  break_violation: "Pause insuffisante",
  out_of_bounds: "Hors session",
  slot_occupied: "Créneau occupé",
  project_already_scheduled: "Projet déjà planifié",
  teacher_unavailable: "Enseignant indisponible",
};

export default function ConflictDashboard() {
  const projectsQuery = useProjects();
  const roomsQuery = useRooms();
  const juriesQuery = useJuries();
  const groupsQuery = useGroups();
  const sessionsQuery = useCoordinatorDefenseSessions();
  const scheduleQuery = useDefenseSchedule();
  const unavailabilityQuery = useCoordinatorUnavailability();

  const isLoading = projectsQuery.isLoading || roomsQuery.isLoading || juriesQuery.isLoading || groupsQuery.isLoading || sessionsQuery.isLoading || scheduleQuery.isLoading || unavailabilityQuery.isLoading;

  const currentSession = sessionsQuery.data?.[0];

  const conflicts = useMemo(() => {
    const schedule = scheduleQuery.data ?? {};
    const allUnavailability = (unavailabilityQuery.data ?? []).map((u) => ({
      date: u.date, slots: u.slots, teacherId: u.teacherId,
    }));
    const context = {
      schedule,
      rooms: Object.fromEntries((roomsQuery.data ?? []).map((r) => [r.id, { id: r.id, name: r.name, capacity: r.capacity }])),
      groups: Object.fromEntries((groupsQuery.data ?? []).map((g) => [g.id, { id: g.id, studentIds: g.studentIds }])),
      projects: Object.fromEntries((projectsQuery.data ?? []).map((p) => [p.id, { id: p.id, studentIds: p.studentIds, supervisorId: p.supervisorId }])),
      teachers: {},
      juries: Object.fromEntries((juriesQuery.data ?? []).map((j) => [j.projectId, { id: j.id, projectId: j.projectId, teacherIds: j.members.map((m) => m.teacherId) }])),
      unavailability: { all: allUnavailability },
      defenseSession: currentSession ? {
        startDate: currentSession.startDate,
        endDate: currentSession.endDate,
        breakDuration: currentSession.breakDuration,
      } : undefined,
    };
    return getAllConflicts(schedule, context);
  }, [scheduleQuery.data, projectsQuery.data, roomsQuery.data, juriesQuery.data, groupsQuery.data, currentSession, unavailabilityQuery.data]);

  const groupedConflicts = useMemo(() => {
    const groups: Record<string, ConflictIssue[]> = {};
    for (const conflict of conflicts) {
      if (!groups[conflict.type]) groups[conflict.type] = [];
      groups[conflict.type].push(conflict);
    }
    return groups;
  }, [conflicts]);

  const totalConflicts = conflicts.length;
  const totalErrors = conflicts.filter((c) => c.severity === "error").length;
  const totalWarnings = conflicts.filter((c) => c.severity === "warning").length;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="coord-conflicts-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conflits de planification</h1>
          <p className="text-muted-foreground">
            Détection des conflits et suggestions de résolution.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Conflits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalConflicts}</p>
            <p className="text-sm text-muted-foreground">détectés au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Erreurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{totalErrors}</p>
            <p className="text-sm text-muted-foreground">bloquantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-warning" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{totalWarnings}</p>
            <p className="text-sm text-muted-foreground">non-bloquants</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(groupedConflicts).length === 0 ? (
        <EmptyState
          variant="card"
          icon={CheckCircle2}
          description="Aucun conflit détecté. La planification est prête à être publiée."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConflicts).map(([type, typeConflicts]) => {
            const Icon = conflictIcons[type] || AlertTriangle;
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {conflictLabels[type] || type}
                    <Badge variant="secondary" className="ml-2">
                      {typeConflicts.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {typeConflicts.filter((c) => c.severity === "error").length} erreur(s),{" "}
                    {typeConflicts.filter((c) => c.severity === "warning").length} avertissement(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeConflicts.map((conflict, i) => (
                    <div
                      key={i}
                      className={`rounded-lg border p-4 ${
                        conflict.severity === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-amber-500/30 bg-amber-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{conflict.message}</p>
                          {conflict.suggestedResolution && (
                            <p className="text-xs text-muted-foreground">
                              Suggestion : {conflict.suggestedResolution}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={conflict.severity === "error" ? "destructive" : "secondary"}
                          className="shrink-0"
                        >
                          {conflict.severity === "error" ? "Bloquant" : "Warning"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
