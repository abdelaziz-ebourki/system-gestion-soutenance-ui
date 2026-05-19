import * as React from "react";
import {
  CalendarDays,
  GripVertical,
  MapPin,
  Save,
  Users,
  X,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import { useJurys, useProjects, useRooms, useSaveSoutenanceSchedule } from "@/hooks/use-queries";
import { validateSlotAssignment } from "@/lib/conflict-engine";
import type { Project } from "@/types";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

const DAYS = ["2026-06-10", "2026-06-11"];
const SLOTS = ["08:30", "10:15", "12:00", "13:45", "15:30"];

type ScheduledCard = {
  id: string;
  title: string;
  roomName: string;
  date: string;
  time: string;
};

function BacklogProject({
  project,
  assigned,
}: {
  project: Project;
  assigned: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: project.id,
      data: { type: "project", project },
      disabled: assigned,
    });

  const style: React.CSSProperties | undefined = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        assigned
          ? "rounded-[22px] border bg-muted p-4 opacity-50"
          : "cursor-grab rounded-[22px] border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-sm active:cursor-grabbing"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{project.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.studentNames?.join(", ") || "Groupe non renseigne"}
          </p>
        </div>
        <Badge variant="outline">{project.supervisorName}</Badge>
      </div>
    </div>
  );
}

function SlotTarget({
  slotKey,
  time,
  scheduled,
  children,
}: {
  slotKey: string;
  time: string;
  scheduled: boolean;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotKey,
    data: { type: "slot", slotKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "min-h-32 rounded-3xl border-2 border-dashed border-primary bg-primary/5 p-4 transition"
          : "min-h-32 rounded-3xl border-2 border-dashed border-border bg-card p-4 transition"
      }
    >
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{time}</span>
        <span>{scheduled ? "Occupe" : "Libre"}</span>
      </div>
      {children}
    </div>
  );
}

export default function SoutenanceDesigner() {
  const projectsQuery = useProjects();
  const roomsQuery = useRooms();
  const jurysQuery = useJurys();
  const saveMutation = useSaveSoutenanceSchedule();
  const projects = projectsQuery.data ?? [];
  const rooms = (roomsQuery.data ?? []).slice(0, 3);
  const jurys = jurysQuery.data ?? [];
  const isLoading = projectsQuery.isLoading || roomsQuery.isLoading || jurysQuery.isLoading;
  const [scheduledProjects, setScheduledProjects] = React.useState<
    Record<string, ScheduledCard>
  >({});
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);

  const assignedProjectIds = new Set(
    Object.values(scheduledProjects).map((project) => project.id),
  );

  const readyProjects = projects.filter((project) =>
    jurys.some((jury) => jury.projectId === project.id),
  );
  const backlogProjects = readyProjects.filter(
    (project) => !assignedProjectIds.has(project.id),
  );

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
    const validation = validateSlotAssignment(
      project.id,
      slotKey,
      Object.fromEntries(
        Object.entries(scheduledProjects).map(([key, value]) => [
          key,
          { id: value.id, title: value.title },
        ]),
      ),
    );

    if (!validation.isValid) {
      toast.error(validation.reason || "Conflit detecte");
      return;
    }

    const [date, roomId, time] = slotKey.split("|");
    const roomName =
      rooms.find((room) => room.id === roomId)?.name || "Salle";
    setScheduledProjects((current) => ({
      ...current,
      [slotKey]: {
        id: project.id,
        title: project.title,
        date,
        roomName,
        time,
      },
    }));
    toast.success(`"${project.title}" positionne le ${date} a ${time}`);
  };

  const handleRemove = (slotKey: string) => {
    setScheduledProjects((current) => {
      const next = { ...current };
      delete next[slotKey];
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(
        Object.fromEntries(
          Object.entries(scheduledProjects).map(([key, value]) => [
            key,
            { id: value.id, title: value.title },
          ]),
        ),
      );
      toast.success("Planning valide avec succes");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la sauvegarde";
      toast.error(message);
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
              Glissez les projets prets vers les salles et creneaux pour
              construire un planning defendable.
            </p>
          </div>
          <Button
            onClick={handleSave}
            isLoading={saveMutation.isPending}
            loadingText="Validation..."
          >
            <Save className="mr-2 size-4" />
            Valider le planning
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="size-4" />
                File de planification
              </CardTitle>
              <CardDescription>
                Seuls les projets avec jury constitue sont proposes ici.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Prets
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {readyProjects.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    A placer
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {backlogProjects.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {backlogProjects.map((project) => (
                  <BacklogProject
                    key={project.id}
                    project={project}
                    assigned={false}
                  />
                ))}
                {backlogProjects.length === 0 && (
                  <div className="rounded-[22px] border border-dashed p-5 text-sm text-muted-foreground">
                    Tous les projets prets ont deja ete places.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {DAYS.map((day) => (
              <Card key={day} className="border-0 shadow-sm">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {day}
                    </CardTitle>
                    <CardDescription>
                      Repartissez les passages salle par salle.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map((room) => (
                      <Badge key={room.id} variant="outline" className="gap-1">
                        <MapPin className="size-3" />
                        {room.name}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="space-y-3">
                      <div className="rounded-2xl bg-muted/50 p-4">
                        <p className="font-medium">{room.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Capacite {room.capacity} places
                        </p>
                      </div>

                      {SLOTS.map((time) => {
                        const slotKey = `${day}|${room.id}|${time}`;
                        const scheduled = scheduledProjects[slotKey];

                        return (
                          <SlotTarget
                            key={slotKey}
                            slotKey={slotKey}
                            time={time}
                            scheduled={!!scheduled}
                          >
                            {scheduled && (
                              <div className="mt-4 rounded-2xl border bg-primary p-4 text-primary-foreground">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium">
                                      {scheduled.title}
                                    </p>
                                    <p className="mt-1 text-sm text-primary-foreground/80">
                                      {projects
                                        .find(
                                          (project) =>
                                            project.id === scheduled.id,
                                        )
                                        ?.studentNames?.join(", ") ||
                                        "Groupe non renseigne"}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(slotKey)}
                                    className="rounded-full p-1 text-primary-foreground/70 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                  >
                                    <X className="size-4" />
                                  </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-primary-foreground/80">
                                  <Users className="size-3" />
                                  {
                                    jurys.find(
                                      (jury) => jury.projectId === scheduled.id,
                                    )?.presidentName
                                  }
                                </div>
                              </div>
                            )}
                          </SlotTarget>
                        );
                      })}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rounded-[22px] border bg-card p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{activeProject.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeProject.studentNames?.join(", ") ||
                    "Groupe non renseigne"}
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
