import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Info,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  dateKey: string;
  time: string;
  student: string;
  room: string;
}

interface AvailabilityCalendarProps {
  initialMonth?: number; // 0-11
  initialYear?: number;
  // Map of YYYY-MM-DD to array of unavailable slot labels
  unavailableSlots: Record<string, string[]>;
  onToggleSlot: (dateKey: string, slot: string) => void;
  sessions: Session[];
  onSave?: () => void;
}

const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Simulated slots defined by Admin (90min duration + 15min rest)
const ADMIN_SLOTS = [
  "08:30 - 10:00",
  "10:15 - 11:45",
  "12:00 - 13:30",
  "13:45 - 15:15",
  "15:30 - 17:00",
];

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export default function AvailabilityCalendar({
  initialMonth = new Date().getMonth(),
  initialYear = new Date().getFullYear(),
  unavailableSlots,
  onToggleSlot,
  sessions,
  onSave,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(
    new Date(initialYear, initialMonth, 1),
  );
  const [activeDay, setActiveDay] = useState<number>(15);

  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    // Adjusting to start on Monday (JS 0 is Sunday, so (day + 6) % 7)
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;

    const days = [];
    // Padding for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(0);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    // Padding for next month to complete 5 or 6 rows (standard 42 slots)
    while (days.length < 42) {
      days.push(0);
    }
    return days;
  }, [viewMonth, viewYear]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(viewYear, viewMonth + offset, 1));
    setActiveDay(1); // Reset active day when changing month
  };

  const activeDateKey = formatDateKey(viewYear, viewMonth, activeDay);

  const getDayStatus = (dateKey: string) => {
    const slots = unavailableSlots[dateKey] || [];
    if (slots.length === 0) return "available";
    if (slots.length === ADMIN_SLOTS.length) return "full-unavailable";
    return "partial";
  };

  return (
    <Card className="border-border shadow-md bg-card overflow-hidden rounded-3xl">
      <div className="grid lg:grid-cols-3 border-b border-border">
        <div className="lg:col-span-2 p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <CalendarIcon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  Calendrier des Indisponibilités
                </h2>
                <p className="text-muted-foreground text-sm">
                  {monthNames[viewMonth]} {viewYear} — Sélectionnez un jour pour
                  gérer vos créneaux
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="h-6 w-6 text-muted-foreground" />
              </Button>
              <span className="font-heading font-bold text-xl px-4 text-foreground min-w-37 text-center">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {calendarGrid.map((day, i) => {
              const dateKey =
                day === 0 ? "" : formatDateKey(viewYear, viewMonth, day);
              const status = day === 0 ? "none" : getDayStatus(dateKey);
              const session =
                day === 0 ? null : sessions.find((s) => s.dateKey === dateKey);
              const isActive = activeDay === day && day !== 0;

              return (
                <div
                  key={i}
                  onClick={() => day !== 0 && setActiveDay(day)}
                  className={`
                    relative aspect-square rounded-2xl border transition-all cursor-pointer p-3 group
                    ${day === 0 ? "invisible" : ""}
                    ${isActive ? "ring-2 ring-primary ring-offset-2 z-10 shadow-sm" : "hover:border-primary/30"}
                    ${status === "full-unavailable" ? "bg-destructive/10 border-destructive/30" : status === "partial" ? "bg-destructive/5 border-destructive/20" : "bg-card border-border"}
                    ${session ? "bg-primary/5 border-primary/20" : ""}
                  `}
                >
                  <span
                    className={`text-base font-bold ${status !== "available" && status !== "none" ? "text-destructive" : session ? "text-primary" : "text-foreground"}`}
                  >
                    {day !== 0 ? day : ""}
                  </span>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {session && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-sm" />
                    )}
                    {status === "partial" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive shadow-sm animate-pulse" />
                    )}
                  </div>

                  {session && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-popover text-popover-foreground rounded-2xl text-xs opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-xl scale-95 group-hover:scale-100 origin-bottom">
                      <p className="font-bold mb-2 border-b border-border pb-2 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-primary" />{" "}
                        {session.time}
                      </p>
                      <p className="font-medium mb-1 truncate">
                        {session.student}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {session.room}
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-muted/30 p-8 space-y-8 border-l border-border flex flex-col h-full">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Détails : {activeDay} {monthNames[viewMonth]}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Gérez vos disponibilités pour cette journée.
            </p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {ADMIN_SLOTS.map((slot) => {
              const isUnavailable = (
                unavailableSlots[activeDateKey] || []
              ).includes(slot);
              const hasSession = sessions.some(
                (s) =>
                  s.dateKey === activeDateKey &&
                  s.time.includes(slot.split(" ")[0]),
              );

              return (
                <button
                  key={slot}
                  onClick={() =>
                    !hasSession && onToggleSlot(activeDateKey, slot)
                  }
                  disabled={hasSession}
                  className={`
										w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left
										${
                      hasSession
                        ? "bg-primary/5 border-primary/10 opacity-60 cursor-not-allowed"
                        : isUnavailable
                          ? "bg-destructive/10 border-destructive/20 text-destructive ring-2 ring-destructive/10"
                          : "bg-card border-border hover:border-primary/40"
                    }
									`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isUnavailable ? "bg-destructive/20 text-destructive" : hasSession ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">{slot}</span>
                  </div>
                  {hasSession ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Jury
                    </Badge>
                  ) : isUnavailable ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-6 space-y-4">
            <div className="p-4 bg-card rounded-2xl border border-border space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  Information Créneau
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Les créneaux sont fixés à 90min par l'administration avec 15min
                de repos entre chaque session.
              </p>
            </div>

            {onSave && (
              <Button
                onClick={onSave}
                className="w-full rounded-2xl h-14 font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Valider mes choix
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
