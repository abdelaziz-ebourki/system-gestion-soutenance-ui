import { useState, useMemo, useEffect } from "react";
import {
  useJuries,
  useRooms,
  useSaveDefenseSchedule,
  useCoordinatorDefenseSessions,
  useCoordinatorUnavailability,
  useTransitionDefenseSession,
} from "@/hooks/use-queries";
import { validateSlotAssignment } from "@/lib/conflict-engine";
import type { ConflictContext } from "@/lib/conflict-engine";
import type { UnavailabilityEntry } from "@/lib/api-coordinator";
import type { Jury, Room, DefenseSession } from "@/types";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

function buildConflictContext(
  schedule: Record<string, { roomId: string; date: string; time: string }>,
  juries: Jury[],
  rooms: Room[],
  unavailabilities: UnavailabilityEntry[],
  currentSession: DefenseSession | undefined,
): ConflictContext {
  return {
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
      unavailabilities.map(
        (u) => [u.teacherId, [{ date: u.date, slots: u.slots, teacherId: u.teacherId }]],
      ),
    ),
    defenseSession: currentSession
      ? { startDate: currentSession.startDate, endDate: currentSession.endDate, breakDuration: currentSession.breakDuration }
      : undefined,
  };
}

export function useDefenseSchedule() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeJuryId, setActiveJuryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, { roomId: string; date: string; time: string }>>({});

  const { data: sessions, isLoading: sessionsLoading } = useCoordinatorDefenseSessions();
  const { data: juries = [], isLoading: juriesLoading } = useJuries();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: unavailabilities = [], isLoading: unavailLoading } = useCoordinatorUnavailability();
  const saveSchedule = useSaveDefenseSchedule();
  const transitionSession = useTransitionDefenseSession();

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
    return Array.from({ length: 14 }).map((_, i) => addDays(start, i));
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
      const context = buildConflictContext(schedule, juries, rooms, unavailabilities, currentSession);
      
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

  const handleAutoGenerate = () => {
    setSchedule({});
    const newSchedule: Record<string, { roomId: string; date: string; time: string }> = {};
    let juryIndex = 0;
    for (const room of rooms) {
      for (const day of days) {
        for (const time of timeSlots) {
          if (juryIndex >= juries.length) break;
          const jury = juries[juryIndex];
          newSchedule[jury.id] = { roomId: room.id, date: format(day, "yyyy-MM-dd"), time };
          juryIndex++;
        }
        if (juryIndex >= juries.length) break;
      }
      if (juryIndex >= juries.length) break;
    }
    setSchedule(newSchedule);
    toast.success(`Planning généré pour ${juryIndex} jury(s)`);
  };

  const handlePublish = async () => {
    if (!currentSession) return;
    try {
      await transitionSession.mutateAsync({ id: currentSession.id, toStatus: "active" });
      toast.success("Session publiée avec succès");
      setIsPublishDialogOpen(false);
    } catch {
      toast.error("Erreur lors de la publication");
    }
  };

  return {
    sessions,
    juries,
    rooms,
    allLoading: sessionsLoading || juriesLoading || roomsLoading || unavailLoading,
    selectedSessionId,
    setSelectedSessionId,
    currentSession,
    days,
    timeSlots,
    searchQuery,
    setSearchQuery,
    selectedRoomId,
    setSelectedRoomId,
    filteredJuries,
    activeJuryId,
    schedule,
    handleDragStart,
    handleDragEnd,
    handleRemove,
    handleSave,
    handleAutoGenerate,
    handlePublish,
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    saveSchedule,
    transitionSession,
  };
}
