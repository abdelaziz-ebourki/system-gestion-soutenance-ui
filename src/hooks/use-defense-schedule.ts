import { useState, useMemo } from "react";
import {
  useJuries,
  useRooms,
  useProjects,
  useTeachersList,
  useCoordinatorUnavailability,
} from "@/hooks/queries";

import { createSlotKey, parseSlotKey } from "@/lib/utils";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useScheduleDraft } from "@/hooks/defense/use-schedule-draft";
import { useScheduleConflictValidator } from "@/hooks/defense/use-schedule-conflict-validator";
import { useScheduleSession } from "@/hooks/defense/use-schedule-session";
import { useScheduleActions } from "@/hooks/defense/use-schedule-actions";
import { TOAST_DURATION_MS } from "@/lib/constants";
import { toast } from "sonner";

export function useDefenseSchedule() {
  const [activeJuryId, setActiveJuryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: juries = [], isLoading: juriesLoading } = useJuries();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachersList();
  const { data: unavailabilities = [], isLoading: unavailLoading } = useCoordinatorUnavailability();

  const {
    sessions,
    sessionsLoading,
    selectedSessionId,
    setSelectedSessionId,
    currentSession,
    days,
    timeSlots,
  } = useScheduleSession();

  const { schedule, setSchedule, updateSlot, removeSlot } = useScheduleDraft();

  const { handleSave, handleAutoGenerate, handlePublish, isPublishDialogOpen, setIsPublishDialogOpen, saveSchedule, transitionSession } = useScheduleActions({
    schedule,
    setSchedule,
    currentSession,
    juries,
    rooms,
    days,
    timeSlots,
  });

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
          toast.error(`${error.message} ${error.suggestedResolution}`, { duration: TOAST_DURATION_MS });
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
