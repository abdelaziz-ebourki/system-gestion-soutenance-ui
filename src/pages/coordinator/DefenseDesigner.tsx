import * as React from "react";
import { useMemo } from "react";
import {
  CalendarDays,
  MapPin,
  Save,
  Search,
  Wand2,
  Send,
  X,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useJuries, useProjects, useRooms, useTeachersList, useSaveDefenseSchedule, useCoordinatorDefenseSessions, useCoordinatorUnavailability } from "@/hooks/use-queries";
import { validateSlotAssignment } from "@/lib/conflict-engine";
import type { Project } from "@/types";
import type { ConflictContext, ConflictIssue } from "@/lib/conflict-engine";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { ModeToggle, type ScheduleMode } from "@/components/coordinator/ModeToggle";
import { RoomSearchSelect } from "@/components/coordinator/RoomSearchSelect";
import { SlotRow, type ScheduledCard } from "@/components/coordinator/SlotRow";
import { ProjectList } from "@/components/coordinator/ProjectList";

function getNextWeekdays(count: number): string[] {
  const result: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (result.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      result.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function generateSlots(start: string, end: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  while (current + durationMinutes <= endTotal) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMinutes;
  }
  return slots;
}

export default function DefenseDesigner() {
  const projectsQuery = useProjects();
  const roomsQuery = useRooms();
  const juriesQuery = useJuries();
  const teachersQuery = useTeachersList();
  const sessionsQuery = useCoordinatorDefenseSessions();
  const saveMutation = useSaveDefenseSchedule();
  const unavailabilityQuery = useCoordinatorUnavailability();
  const projects = projectsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];
  const juries = juriesQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const defenseSessions = sessionsQuery.data ?? [];
  const isLoading = projectsQuery.isLoading || roomsQuery.isLoading || juriesQuery.isLoading || sessionsQuery.isLoading;

  const DAYS = useMemo(() => getNextWeekdays(2), []);
  const session = defenseSessions[0];
  const SLOTS = useMemo(
    () => generateSlots(
      "08:00",
      "18:00",
      session?.defenseDuration ?? 30,
    ),
    [session?.defenseDuration],
  );

  const [scheduledProjects, setScheduledProjects] = React.useState<Record<string, ScheduledCard>>({});
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);
  const [mode, setMode] = React.useState<ScheduleMode>("click");
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(rooms[0]?.id ?? null);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [filterQuery, setFilterQuery] = React.useState("");
  const [activeDayIndex, setActiveDayIndex] = React.useState(0);
  const [isAutoGenerating, setIsAutoGenerating] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const assignedProjectIds = React.useMemo(
    () => new Set(Object.values(scheduledProjects).map((p) => p.id)),
    [scheduledProjects],
  );

  const readyProjects = React.useMemo(
    () => projects.filter((p) => juries.some((j) => j.projectId === p.id)),
    [projects, juries],
  );
  const backlogProjects = React.useMemo(
    () => readyProjects.filter((p) => !assignedProjectIds.has(p.id)),
    [readyProjects, assignedProjectIds],
  );

  const filteredBacklog = React.useMemo(
    () => {
      if (!filterQuery) return backlogProjects;
      const q = filterQuery.toLowerCase();
      return backlogProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.studentNames?.some((n) => n.toLowerCase().includes(q)) ||
          p.supervisorName.toLowerCase().includes(q),
      );
    },
    [backlogProjects, filterQuery],
  );

  const activeDay = DAYS[activeDayIndex];
  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  const buildConflictContext = React.useCallback((): ConflictContext => {
    const allUnavailability = (unavailabilityQuery.data ?? []).map((u) => ({
      date: u.date, slots: u.slots, teacherId: u.teacherId,
    }));
    return {
    schedule: Object.fromEntries(
      Object.entries(scheduledProjects).map(([key, value]) => {
        const [, roomIdFromKey] = key.split("|");
        return [
          key,
          { id: value.id, title: value.title, date: value.date, time: value.time, roomId: roomIdFromKey },
        ];
      }),
    ),
    rooms: Object.fromEntries(rooms.map((r) => [r.id, { id: r.id, name: r.name, capacity: r.capacity }])),
    groups: {},
    projects: Object.fromEntries(projects.map((p) => [p.id, { id: p.id, studentIds: p.studentIds, supervisorId: p.supervisorId }])),
    teachers: Object.fromEntries(teachers.map((t) => [t.id, { id: t.id, name: `${t.firstName} ${t.lastName}` }])),
    juries: Object.fromEntries(juries.map((j) => [j.projectId, { id: j.id, projectId: j.projectId, teacherIds: j.members.map((m) => m.teacherId) }])),
    unavailability: { all: allUnavailability },
  }; }, [scheduledProjects, rooms, projects, teachers, juries, unavailabilityQuery.data]);

  function showValidationFeedback(issues: ConflictIssue[]) {
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");
    if (errors.length > 0) {
      toast.error(errors[0].message);
    }
    if (warnings.length > 0) {
      toast.warning(
        warnings.length === 1
          ? warnings[0].message
          : `${warnings.length} avertissement(s): ${warnings.map((w) => w.message.toLowerCase()).join(", ")}`,
      );
    }
  }

  function handlePlace(slotKey: string) {
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    const validation = validateSlotAssignment(project.id, slotKey, buildConflictContext());

    if (!validation.isValid) {
      showValidationFeedback(validation.issues);
      return;
    }

    const [date, roomId, time] = slotKey.split("|");
    const roomName = rooms.find((r) => r.id === roomId)?.name || "Salle";
    setScheduledProjects((prev) => ({
      ...prev,
      [slotKey]: { id: project.id, title: project.title, date, roomName, time },
    }));
    setSelectedProjectId(null);
    toast.success(`"${project.title}" positionné le ${date} à ${time}`);
  }

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; project: Project } | undefined;
    if (data?.type === "project") {
      setActiveProject(data.project);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProject(null);
    const { active, over } = event;
    if (!over) return;

    const project = active.data.current?.project as Project | undefined;
    if (!project) return;

    const slotKey = over.id as string;

    const validation = validateSlotAssignment(project.id, slotKey, buildConflictContext());

    if (!validation.isValid) {
      showValidationFeedback(validation.issues);
      return;
    }

    const [date, roomId, time] = slotKey.split("|");
    const roomName = rooms.find((r) => r.id === roomId)?.name || "Salle";
    setScheduledProjects((prev) => ({
      ...prev,
      [slotKey]: { id: project.id, title: project.title, date, roomName, time },
    }));
    toast.success(`"${project.title}" positionné le ${date} à ${time}`);
  };

  const handleRemove = (slotKey: string) => {
    setScheduledProjects((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(
        Object.fromEntries(
          Object.entries(scheduledProjects).map(([key, value]) => {
            const [, roomIdFromKey] = key.split("|");
            return [
              key,
              { id: value.id, title: value.title, date: value.date, time: value.time, roomId: roomIdFromKey },
            ];
          }),
        ),
      );
      toast.success("Planning validé avec succès");
    } catch (error) {
      toastError(error, "Erreur lors de la sauvegarde");
    }
  };

  const handleAutoGenerate = async () => {
    if (!session) {
      toast.error("Aucune session de défense active.");
      return;
    }
    setIsAutoGenerating(true);
    try {
      const data = await api<{ schedule: Record<string, { id: string; title: string; date: string; time: string; roomId: string }> }>(
        "/coordinator/schedule/auto-generate",
        { method: "POST", body: JSON.stringify({ defenseSessionId: session.id }) },
      );
      const cards: Record<string, ScheduledCard> = {};
      for (const [key, assignment] of Object.entries(data.schedule)) {
        const [date, roomId, time] = key.split("|");
        cards[key] = {
          id: assignment.id,
          title: assignment.title,
          date,
          roomName: rooms.find((r) => r.id === roomId)?.name ?? "Salle",
          time,
        };
      }
      setScheduledProjects(cards);
      toast.success(`${Object.keys(cards).length} créneaux générés automatiquement.`);
    } catch (error) {
      toastError(error, "Erreur lors de la génération automatique.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!session) {
      toast.error("Aucune session de défense active.");
      return;
    }
    if (Object.keys(scheduledProjects).length === 0) {
      toast.error("Aucun créneau à publier.");
      return;
    }
    if (!window.confirm("Publier le planning va convertir les créneaux en soutenances et notifier les utilisateurs. Continuer ?")) return;
    setIsPublishing(true);
    try {
      const result = await api<{ message: string }>(
        "/coordinator/schedule/publish",
        { method: "POST", body: JSON.stringify({ defenseSessionId: session.id }) },
      );
      setScheduledProjects({});
      toast.success(result.message);
    } catch (error) {
      toastError(error, "Erreur lors de la publication.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Designer de soutenances
            </h1>
            <p className="text-muted-foreground">
              Placez les projets prêts dans les créneaux disponibles.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleAutoGenerate}
              isLoading={isAutoGenerating}
              loadingText="Génération..."
            >
              <Wand2 className="mr-2 size-4" />
              Auto-générer
            </Button>
            <Button
              onClick={handleSave}
              isLoading={saveMutation.isPending}
              loadingText="Validation..."
            >
              <Save className="mr-2 size-4" />
              Valider le planning
            </Button>
            <Button
              variant="default"
              onClick={handlePublish}
              isLoading={isPublishing}
              loadingText="Publication..."
            >
              <Send className="mr-2 size-4" />
              Publier le planning
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Tabs
            value={String(activeDayIndex)}
            onValueChange={(v) => setActiveDayIndex(Number(v))}
          >
            <TabsList>
              {DAYS.map((day, i) => (
                <TabsTrigger key={day} value={String(i)}>
                  <CalendarDays className="size-4" />
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="w-72">
            <RoomSearchSelect
              rooms={rooms}
              value={activeRoomId}
              onChange={setActiveRoomId}
            />
          </div>
          <ModeToggle value={mode} onChange={setMode} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                File de planification
              </CardTitle>
              <CardDescription>
                Seuls les projets avec jury constitué sont proposés ici.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Prêts
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {readyProjects.length}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    A placer
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {backlogProjects.length}
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un projet..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2">
                {filteredBacklog.length === 0 ? (
                  <EmptyState variant="dashed" description="Aucun projet trouvé." />
                ) : (
                  <ProjectList
                    projects={filteredBacklog}
                    assignedProjectIds={assignedProjectIds}
                    mode={mode}
                    selectedProjectId={selectedProjectId}
                    onSelect={setSelectedProjectId}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    {activeRoom?.name ?? "Salle"}
                  </CardTitle>
                  <CardDescription>
                    {activeRoom
                      ? `Capacité ${activeRoom.capacity} places — ${activeDay}`
                      : "Sélectionnez une salle"}
                  </CardDescription>
                </div>
                {activeRoom && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="size-3" />
                    {activeRoom.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {!activeRoomId ? (
                  <EmptyState variant="dashed" description="Choisissez une salle pour voir les créneaux." />
                ) : (
                  SLOTS.map((time) => {
                    const slotKey = `${activeDay}|${activeRoomId}|${time}`;
                    const scheduled = scheduledProjects[slotKey];

                    return (
                      <SlotRow
                        key={slotKey}
                        slotKey={slotKey}
                        time={time}
                        scheduled={scheduled}
                        projects={projects}
                        juries={juries}
                        mode={mode}
                        selectedProjectId={selectedProjectId}
                        onPlace={mode === "click" ? handlePlace : () => {}}
                        onRemove={handleRemove}
                      />
                    );
                  })
                )}
              </CardContent>
            </Card>

            {mode === "click" && selectedProjectId && (
              <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3 text-sm">
                <span>
                  Projet sélectionné :{" "}
                  <strong>{projects.find((p) => p.id === selectedProjectId)?.title}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId(null)}
                  className="ml-auto rounded-full p-1 text-muted-foreground transition hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rounded-lg border bg-card p-4 shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{activeProject.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeProject.studentNames?.join(", ") || "Groupe non renseigné"}
                </p>
              </div>
              <Badge variant="outline">{activeProject.supervisorName}</Badge>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
