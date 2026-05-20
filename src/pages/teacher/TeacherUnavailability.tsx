import { useMemo } from "react";
import * as React from "react";
import { Ban, CalendarClock, Save } from "lucide-react";

import { useTeacherSchedule, useTeacherUnavailability, useSaveTeacherUnavailability } from "@/hooks/use-queries";
import type { TeacherUnavailability } from "@/types";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import AvailabilityCalendar from "@/components/academic/AvailabilityCalendar";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
} from "@/components/ui";

type CalendarSession = {
  dateKey: string;
  time: string;
  student: string;
  room: string;
};

export default function TeacherUnavailability() {
  const scheduleQuery = useTeacherSchedule();
  const unavailabilityQuery = useTeacherUnavailability();
  const saveMutation = useSaveTeacherUnavailability();
  const schedule = scheduleQuery.data ?? [];
  const isLoading = scheduleQuery.isLoading || unavailabilityQuery.isLoading;
  const [unavailability, setUnavailability] =
    React.useState<TeacherUnavailability>({
      slotsByDate: {},
    });

  React.useEffect(() => {
    if (unavailabilityQuery.data) {
      setUnavailability(unavailabilityQuery.data);
    }
  }, [unavailabilityQuery.data]);

  const handleToggleSlot = (dateKey: string, slot: string) => {
    setUnavailability((current) => {
      const currentSlots = current.slotsByDate[dateKey] || [];
      const nextSlots = currentSlots.includes(slot)
        ? currentSlots.filter((item) => item !== slot)
        : [...currentSlots, slot];
      const nextState = { ...current.slotsByDate };

      if (nextSlots.length === 0) {
        delete nextState[dateKey];
      } else {
        nextState[dateKey] = nextSlots;
      }

      return { slotsByDate: nextState };
    });
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(unavailability);
      toast.success("Indisponibilités enregistrées");
    } catch (error) {
      toastError(error, "Erreur lors de l'enregistrement");
    }
  };

  const totalBlockedSlots = Object.values(unavailability.slotsByDate).reduce(
    (total, slots) => total + slots.length,
    0,
  );

  const sessions: CalendarSession[] = useMemo(() => schedule.map((defense) => ({
    dateKey: defense.date,
    time: `${defense.startTime} - ${defense.endTime}`,
    student: defense.studentNames.join(", "),
    room: defense.roomName,
  })), [schedule]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Mes indisponibilités
          </h1>
          <p className="text-muted-foreground">
            Gérez vos créneaux d'indisponibilité pour la planification des
            soutenances.
          </p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={saveMutation.isPending}
          loadingText="Enregistrement..."
        >
          <Save className="mr-2 size-4" />
          Enregistrer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Créneaux bloqués" value={totalBlockedSlots} icon={Ban} />
        <StatsCard label="Jours concernés" value={Object.keys(unavailability.slotsByDate).length} icon={CalendarClock} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rappel</CardTitle>
            <CardDescription>
              Les créneaux déjà associés à une soutenance sont verrouillés.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chargement du calendrier...
          </CardContent>
        </Card>
      ) : (
        <AvailabilityCalendar
          unavailableSlots={unavailability.slotsByDate}
          onToggleSlot={handleToggleSlot}
          sessions={sessions}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
