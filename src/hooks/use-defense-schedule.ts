import { useState, useMemo, useEffect } from "react";
import {
  useJuries,
  useRooms,
  useProjects,
  useTeachersList,
  useSaveSchedules,
  useCoordinatorDefenseSessions,
  useCoordinatorUnavailability,
  useTransitionDefenseSession,
} from "@/hooks/queries";
import type { ScheduleSlot } from "@/lib/api-coordinator";

import { toast } from "sonner";
import { getErrorMessage, createSlotKey, parseSlotKey } from "@/lib/utils";
import { addDays, differenceInDays } from "date-fns";
import { TOAST_DURATION_MS } from "@/lib/constants";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useScheduleDraft } from "@/hooks/defense/use-schedule-draft";
import { useScheduleAutoGenerator } from "@/hooks/defense/use-schedule-auto-generator";
import { useScheduleConflictValidator } from "@/hooks/defense/use-schedule-conflict-validator";

export function useDefenseSchedule() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [activeJuryId, setActiveJuryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  const { data: sessions, isLoading: sessionsLoading } = useCoordinatorDefenseSessions();
  const { data: juries = [], isLoading: juriesLoading } = useJuries();
  const { data: roomsPage, isLoading: roomsLoading } = useRooms();
  const rooms = roomsPage?.items ?? [];
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();
  const { data: unavailabilities = [], isLoading: unavailLoading } = useCoordinatorUnavailability();
  const saveSchedule = useSaveSchedules();
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
    const end = new Date(currentSession.endDate);
    const diffDays = Math.max(1, differenceInDays(end, start) + 1);
    return Array.from({ length: diffDays }).map((_, i) => addDays(start, i));
  }, [currentSession]);

  const timeSlots = useMemo(() => {
    if (!currentSession) return [];
    return [];
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
          j.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [juries, searchQuery, schedule],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveJuryId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJuryId(null);

    if (over && selectedRoomId) {
      const juryId = active.id as number;
      const { date, time } = parseSlotKey(over.id as string);

      const jury = juries.find((j) => j.id === juryId);
      if (!jury) return;

      const slotKey = createSlotKey(date, String(selectedRoomId), time);
      const result = validateSlot(jury.projectId, slotKey);

      if (!result.isValid) {
        const error = result.issues.find(i => i.severity === "error") || result.issues[0];
        if (error.suggestedResolution) {
          toast.error(`${error.message} ${error.suggestedResolution}`, { duration: TOAST_DURATION_MS });
        } else {
          toast.error(error.message);
        }
        return;
      }

      updateSlot(String(juryId), { roomId: selectedRoomId, date, time });
      toast.success("Positionné avec succès");
    }
  };

  const handleRemove = (juryId: number) => {
    removeSlot(String(juryId));
  };

  const handleSave = async () => {
    if (Object.keys(schedule).length === 0) {
      toast.error("Aucune modification à enregistrer");
      return;
    }
    if (!selectedSessionId) return;

    try {
      const slots: ScheduleSlot[] = Object.entries(schedule).map(([key, s]) => {
        const juryId = Number(key);
        const jury = juries.find((j) => j.id === juryId);
        return {
          title: jury?.projectTitle ?? "",
          date: s.date,
          time: s.time,
          projectId: jury?.projectId ?? 0,
          roomId: Number(s.roomId),
        };
      });
      await saveSchedule.mutateAsync({ defenseSessionId: selectedSessionId, slots });
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
