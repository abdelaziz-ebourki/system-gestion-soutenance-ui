import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { createSlotKey } from "@/lib/utils";
import { Card } from "@/components/ui";
import DroppableCalendarCell from "@/components/coordinator/DroppableCalendarCell";
import type { Jury, Room } from "@/types";
import { useMemo } from "react";

interface DefenseCalendarProps {
  days: Date[];
  timeSlots: string[];
  schedule: Record<string, { roomId: number; date: string; time: string }>;
  juries: Jury[];
  onRemove: (juryId: number) => void;
  rooms: Room[];
}

export default function DefenseCalendar({
  days,
  timeSlots,
  schedule,
  juries,
  onRemove,
  rooms,
}: DefenseCalendarProps) {
  const scheduleLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const [juryId, entry] of Object.entries(schedule)) {
      const key = createSlotKey(entry.date, String(entry.roomId), entry.time);
      map.set(key, juryId);
    }
    return map;
  }, [schedule]);

  const juryLookup = useMemo(() => {
    const map = new Map<string, Jury>();
    for (const jury of juries) {
      map.set(String(jury.id), jury);
    }
    return map;
  }, [juries]);

  if (!rooms.length) {
    return (
      <div className="h-[500px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5" data-testid="coord-calendar-no-room">
        <div className="p-4 rounded-full bg-muted/20">
          <MapPin className="size-10 opacity-20" />
        </div>
        <p className="text-lg">Aucune salle disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="coord-calendar">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rooms.map((room) => (
          <Card key={room.id} className="min-w-[320px] flex-shrink-0 overflow-hidden" data-testid={`coord-room-column-${room.id}`}>
            <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur border-b px-4 py-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                {room.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" data-testid={`coord-room-table-${room.id}`}>
                <thead>
                  <tr className="bg-muted/30">
                    <th className="p-2 border text-left font-medium text-xs uppercase tracking-wider w-20">Heure</th>
                    {days.map((day) => (
                      <th key={day.toISOString()} className="p-2 border text-center font-medium min-w-[140px]">
                        <div className="text-xs uppercase text-muted-foreground">{format(day, "EEE", { locale: fr })}</div>
                        <div className="text-xs">{format(day, "dd MMM", { locale: fr })}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot}>
                      <td className="p-2 border font-mono text-xs font-medium bg-muted/20 text-center">{slot}</td>
                      {days.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const key = createSlotKey(dateStr, String(room.id), slot);
                        const scheduledJuryId = scheduleLookup.get(key);
                        const jury = scheduledJuryId ? juryLookup.get(scheduledJuryId) ?? null : null;

                        return (
                          <DroppableCalendarCell
                            key={`${room.id}|${dateStr}|${slot}`}
                            id={key}
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
        ))}
      </div>
    </div>
  );
}
