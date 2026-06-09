import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin, CalendarDays } from "lucide-react";
import { createSlotKey } from "@/lib/utils";
import {
  Card,
} from "@/components/ui";
import { RoomSearchSelect } from "@/components/coordinator/RoomSearchSelect";
import DroppableCalendarCell from "@/components/coordinator/DroppableCalendarCell";
import type { Jury, Room } from "@/types";
import { useMemo } from "react";

interface DefenseCalendarProps {
  days: Date[];
  timeSlots: string[];
  schedule: Record<string, { roomId: number; date: string; time: string }>;
  juries: Jury[];
  selectedRoomId: number | null;
  onRemove: (juryId: number) => void;
  rooms: Room[];
  onRoomChange: (roomId: number | null) => void;
}

export default function DefenseCalendar({
  days,
  timeSlots,
  schedule,
  juries,
  selectedRoomId,
  onRemove,
  rooms,
  onRoomChange,
}: DefenseCalendarProps) {
  // Precompute lookup maps to avoid expensive .find() calls in render loop
  const scheduleLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const [juryId, jurySlot] of Object.entries(schedule)) {
      if (jurySlot.roomId === selectedRoomId) {
        const key = createSlotKey(jurySlot.date, String(jurySlot.roomId), jurySlot.time);
        map.set(key, juryId);
      }
    }
    return map;
  }, [schedule, selectedRoomId]);

  const juryLookup = useMemo(() => {
    const map = new Map<string, Jury>();
    for (const jury of juries) {
      map.set(String(jury.id), jury);
    }
    return map;
  }, [juries]);

  return (
    <div className="space-y-4" data-testid="coord-calendar">
      <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border">
        <div className="flex-1 max-w-sm">
          <RoomSearchSelect
            rooms={rooms}
            value={selectedRoomId !== null ? String(selectedRoomId) : null}
            onChange={(val) => onRoomChange(val ? Number(val) : null)}
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
            <table className="w-full border-collapse" data-testid="coord-calendar-table">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 border text-left font-medium text-xs uppercase tracking-wider w-24">Heure</th>
                  {days?.map((day) => (
                    <th key={day.toISOString()} className="p-3 border text-center font-medium min-w-[200px]">
                      <div className="text-xs uppercase text-muted-foreground">{format(day, "EEEE", { locale: fr })}</div>
                      <div className="text-sm">{format(day, "dd MMM", { locale: fr })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots?.map((slot) => (
                  <tr key={slot}>
                    <td className="p-3 border font-mono text-sm font-medium bg-muted/20 text-center">{slot}</td>
                     {days?.map((day) => {
                       const dateStr = format(day, "yyyy-MM-dd");
                        const key = createSlotKey(dateStr, String(selectedRoomId!), slot);
                       const scheduledJuryId = scheduleLookup.get(key);
                       const jury = scheduledJuryId ? juryLookup.get(scheduledJuryId) ?? null : null;

                       return (
                         <DroppableCalendarCell
                           key={`${dateStr}|${slot}`}
                           id={`${dateStr}|${slot}`}
                           jury={jury}
                           onRemove={() => jury && onRemove(jury.id)}
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
        <div className="h-[500px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5" data-testid="coord-calendar-no-room">
          <div className="p-4 rounded-full bg-muted/20">
            <MapPin className="size-10 opacity-20" />
          </div>
          <p className="text-lg">Veuillez sélectionner une salle pour afficher le planning</p>
        </div>
      )}
    </div>
  );
}
