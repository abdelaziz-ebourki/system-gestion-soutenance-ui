import { useMemo, useState, useEffect } from "react";
import type { ComponentProps } from "react";
import {
  CalendarDays,
  MapPin,
  Save,
  Search,
  Wand2,
  Send,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useJuries, useRooms, useSaveDefenseSchedule, useCoordinatorDefenseSessions, useCoordinatorUnavailability } from "@/hooks/use-queries";
import { validateSlotAssignment } from "@/lib/conflict-engine";
import type { ConflictContext } from "@/lib/conflict-engine";
import type { Jury } from "@/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { RoomSearchSelect } from "@/components/coordinator/RoomSearchSelect";
import DraggableJurySlot from "@/components/coordinator/DraggableJurySlot";
import DroppableCalendarCell from "@/components/coordinator/DroppableCalendarCell";

const DAYS_TO_SHOW = 14;

export default function DefenseDesigner() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeJuryId, setActiveJuryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: sessions } = useCoordinatorDefenseSessions();
  const { data: juries = [] } = useJuries();
  const { data: rooms = [] } = useRooms();
  const { data: unavailabilities = [] } = useCoordinatorUnavailability();
  const saveSchedule = useSaveDefenseSchedule();

  const [schedule, setSchedule] = useState<Record<string, { roomId: string; date: string; time: string }>>({});

  useEffect(() => {
    if (sessions?.length && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const currentSession = useMemo(
    () => sessions?.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId],
  );

  const days = useMemo(() => {
    if (!currentSession) return [];
    const start = new Date(currentSession.startDate);
    return Array.from({ length: DAYS_TO_SHOW }).map((_, i) => addDays(start, i));
  }, [currentSession]);

  const timeSlots = useMemo(() => {
    if (!currentSession) return [];
    const slots = [];
    let current = new Date(`2000-01-01T${currentSession.startTime}`);
    const end = new Date(`2000-01-01T${currentSession.endTime}`);

    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current = new Date(current.getTime() + currentSession.defenseDuration * 60000);
    }
    return slots;
  }, [currentSession]);

  const filteredJuries = useMemo(
    () =>
      juries.filter(
        (j) =>
          !schedule[j.id] &&
          (j.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.studentNames.some((n) =>
              n.toLowerCase().includes(searchQuery.toLowerCase()),
            )),
      ),
    [juries, searchQuery, schedule],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveJuryId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJuryId(null);

    if (over && selectedRoomId) {
      const juryId = active.id as string;
      const [date, time] = (over.id as string).split("|");

      const jury = juries.find((j) => j.id === juryId);
      if (!jury) return;

      const slotKey = `${date}|${selectedRoomId}|${time}`;

      const context: ConflictContext = {
        schedule: Object.fromEntries(
          Object.entries(schedule).map(([id, s]) => [
            id,
            {
              id,
              title: juries.find((j) => j.id === id)?.projectTitle ?? "",
              date: s.date,
              time: s.time,
              roomId: s.roomId,
            },
          ]),
        ),
        rooms: Object.fromEntries(
          rooms.map((r) => [r.id, { id: r.id, name: r.name, capacity: r.capacity }]),
        ),
        groups: {},
        projects: {},
        teachers: {},
        juries: Object.fromEntries(
          juries.map((j) => [
            j.id,
            { id: j.id, projectId: j.projectId, teacherIds: j.members.map((m) => m.teacherId) },
          ]),
        ),
        unavailability: Object.fromEntries(
          (unavailabilities as { id: string; teacherId: string; date: string; slots: string[] }[]).map(
            (u) => [u.teacherId, [{ date: u.date, slots: u.slots, teacherId: u.teacherId }]],
          ),
        ),
        defenseSession: currentSession
          ? { startDate: currentSession.startDate, endDate: currentSession.endDate, breakDuration: currentSession.breakDuration }
          : undefined,
      };

      const result = validateSlotAssignment(jury.projectId, slotKey, context);

      if (!result.isValid) {
        toast.error(result.issues[0]?.message ?? "Conflit détecté");
        return;
      }

      setSchedule((prev) => ({
        ...prev,
        [juryId]: { roomId: selectedRoomId, date, time },
      }));
      toast.success("Positionné avec succès");
    }
  };

  const handleRemove = (juryId: string) => {
    setSchedule((prev) => {
      const next = { ...prev };
      delete next[juryId];
      return next;
    });
  };

  const handleSave = async () => {
    if (Object.keys(schedule).length === 0) {
      toast.error("Aucune modification à enregistrer");
      return;
    }

    try {
      await saveSchedule.mutateAsync(
        Object.fromEntries(
          Object.entries(schedule).map(([juryId, s]) => [
            juryId,
            {
              id: juryId,
              title: juries.find((j) => j.id === juryId)?.projectTitle ?? "",
              date: s.date,
              time: s.time,
              roomId: s.roomId,
            },
          ]),
        ),
      );
      toast.success("Planning enregistré avec succès");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (!sessions?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificateur de Soutenances</h1>
          <p className="text-muted-foreground">
            Aucune session de soutenance disponible. Créez d'abord une session dans
            {" "}<a href="/coordinator/defense-sessions" className="text-primary underline">Gestion des sessions</a>.
          </p>
        </div>
      </div>
    );
  }

  if (!currentSession) return <Skeleton className="h-[600px] w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planificateur de Soutenances</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Session:</span>
            <Select
              value={selectedSessionId ?? undefined}
              onValueChange={setSelectedSessionId}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Sélectionner une session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Wand2 className="size-4" /> Génération Auto
          </Button>
          <Button className="gap-2" onClick={handleSave} isLoading={saveSchedule.isPending}>
            <Save className="size-4" /> Enregistrer
          </Button>
          <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
            <Send className="size-4" /> Publier
          </Button>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Jury List */}
          <Card className="col-span-3 h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UsersIcon className="size-5" /> À positionner
                <Badge variant="secondary" className="ml-auto">{filteredJuries.length}</Badge>
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un jury..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 pt-0">
              {filteredJuries.map((jury) => (
                <DraggableJurySlot key={jury.id} jury={jury} />
              ))}
              {filteredJuries.length === 0 && (
                <div className="text-center py-10 text-muted-foreground italic text-sm">
                  Aucun jury en attente
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content - Calendar */}
          <div className="col-span-9 space-y-4">
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border">
              <div className="flex-1 max-w-sm">
                <RoomSearchSelect
                  rooms={rooms}
                  value={selectedRoomId}
                  onChange={setSelectedRoomId}
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarDays className="size-4" />
                Sélectionnez une salle pour voir son planning
              </div>
            </div>

            {selectedRoomId ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-3 border text-left font-medium text-xs uppercase tracking-wider w-24">Heure</th>
                        {days.map((day) => (
                          <th key={day.toISOString()} className="p-3 border text-center font-medium min-w-[200px]">
                            <div className="text-xs uppercase text-muted-foreground">{format(day, "EEEE", { locale: fr })}</div>
                            <div className="text-sm">{format(day, "dd MMM", { locale: fr })}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot) => (
                        <tr key={slot}>
                          <td className="p-3 border font-mono text-sm font-medium bg-muted/20 text-center">{slot}</td>
                          {days.map((day) => {
                            const dateStr = format(day, "yyyy-MM-dd");
                            const scheduledJuryId = Object.keys(schedule).find(
                              (id) => schedule[id].date === dateStr && schedule[id].time === slot && schedule[id].roomId === selectedRoomId
                            );
                            const jury: Jury | null = scheduledJuryId ? juries.find(j => j.id === scheduledJuryId) ?? null : null;

                            return (
                              <DroppableCalendarCell
                                key={`${dateStr}|${slot}`}
                                id={`${dateStr}|${slot}`}
                                jury={jury}
                                onRemove={() => jury && handleRemove(jury.id)}
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="h-[500px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5">
                <div className="p-4 rounded-full bg-muted/20">
                  <MapPin className="size-10 opacity-20" />
                </div>
                <p className="text-lg">Veuillez sélectionner une salle pour afficher le planning</p>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeJuryId ? (
            <div className="w-64">
              <DraggableJurySlot
                jury={juries.find((j) => j.id === activeJuryId)!}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function UsersIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
