import { useState, useMemo, useEffect } from "react";
import { useCoordinatorDefenseSessions } from "@/hooks/queries";
import { format, addDays, differenceInDays } from "date-fns";
import { MS_PER_MINUTE } from "@/lib/constants";

export function useScheduleSession() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useCoordinatorDefenseSessions();

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
    const slots = [];
    let current = new Date(`2000-01-01T${currentSession.startTime}`);
    const end = new Date(`2000-01-01T${currentSession.endTime}`);

    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current = new Date(current.getTime() + currentSession.defenseDuration * MS_PER_MINUTE);
    }
    return slots;
  }, [currentSession]);

  return {
    sessions: sessions ?? [],
    sessionsLoading,
    selectedSessionId,
    setSelectedSessionId,
    currentSession,
    days,
    timeSlots,
  };
}
