import { useState } from "react";
import { useSaveDefenseSchedule, useTransitionDefenseSession } from "@/hooks/queries";
import { useScheduleAutoGenerator } from "@/hooks/defense/use-schedule-auto-generator";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type { Room, Jury } from "@/types";
import type { ScheduleEntry } from "@/hooks/defense/use-schedule-draft";

interface UseScheduleActionsOptions {
  schedule: Record<string, ScheduleEntry>;
  setSchedule: (schedule: Record<string, ScheduleEntry>) => void;
  currentSession?: { id: string; startDate: string; endDate: string; startTime: string; endTime: string; defenseDuration: number } | null;
  juries: Jury[];
  rooms: Room[];
  days: Date[];
  timeSlots: string[];
}

export function useScheduleActions({
  schedule,
  setSchedule,
  currentSession,
  juries,
  rooms,
  days,
  timeSlots,
}: UseScheduleActionsOptions) {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const saveSchedule = useSaveDefenseSchedule();
  const transitionSession = useTransitionDefenseSession();

  const { generateSchedule } = useScheduleAutoGenerator(rooms, days, timeSlots, juries);

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
    handleSave,
    handleAutoGenerate,
    handlePublish,
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    saveSchedule,
    transitionSession,
  };
}
