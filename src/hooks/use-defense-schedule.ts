import { useState, useMemo, useEffect } from "react";
import {
  useJuries,
  useRooms,
  useProjects,
  useTeachersList,
  useSaveDefenseSchedule,
  useCoordinatorDefenseSessions,
  useCoordinatorUnavailability,
  useTransitionDefenseSession,
} from "@/hooks/use-queries";
import { toast } from "sonner";
import { getErrorMessage, createSlotKey, parseSlotKey } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { CALENDAR_WINDOW_DAYS } from "@/lib/constants";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useScheduleDraft } from "@/hooks/defense/use-schedule-draft";
import { useScheduleAutoGenerator } from "@/hooks/defense/use-schedule-auto-generator";
import { useScheduleConflictValidator } from "@/hooks/defense/use-schedule-conflict-validator";

export function useDefenseSchedule() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeJuryId, setActiveJuryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  const { data: sessions, isLoading: sessionsLoading } = useCoordinatorDefenseSessions();
  const { data: juries = [], isLoading: juriesLoading } = useJuries();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();
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
    return Array.from({ length: CALENDAR_WINDOW_DAYS }).map((_, i) => addDays(start, i));
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

  const { schedule, setSchedule, updateSlot, removeSlot } = useScheduleDraft();

  const { generateSchedule } = useScheduleAutoGenerator(rooms, days, timeSlots, juries);

  const { validateSlot } = useScheduleConflictValidator({
    schedule,
    juries,
    rooms,
    projects,
    teachers,
    unavailabilities,
    currentSession,
    allTimeSlots: timeSlots,
  });

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
      const { date, time } = parseSlotKey(over.id as string);

      const jury = juries.find((j) => j.id === juryId);
      if (!jury) return;

      const slotKey = createSlotKey(date, selectedRoomId, time);
      const result = validateSlot(jury.projectId, slotKey);

      if (!result.isValid) {
        const error = result.issues.find(i => i.severity === "error") || result.issues[0];
        if (error.suggestedResolution) {
          toast.error(`${error.message} ${error.suggestedResolution}`, { duration: 5000 });
        } else {
          toast.error(error.message);
        }
        return;
      }

      updateSlot(juryId, { roomId: selectedRoomId, date, time });
      toast.success("Positionné avec succès");
    }
  };

  const handleRemove = (juryId: string) => {
    removeSlot(juryId);
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de l'enregistrement"));
    }
  };

  const handleAutoGenerate = () => {
    const newSchedule = generateSchedule();
    setSchedule(newSchedule);
    toast.success(`Planning généré pour ${Object.keys(newSchedule).length} jury(s)`);
  };

  const handlePublish = async () => {
    if (!currentSession) return;
    try {
      await transitionSession.mutateAsync({ id: currentSession.id, toStatus: "active" });
      toast.success("Session publiée avec succès");
      setIsPublishDialogOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de la publication"));
    }
  };

  return {
    sessions,
    juries,
    rooms,
    allLoading: sessionsLoading || juriesLoading || roomsLoading || unavailLoading || projectsLoading || teachersLoading,
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
