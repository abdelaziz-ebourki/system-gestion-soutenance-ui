import { SimpleSelect } from "@/components/ui";
import type { Room } from "@/types";

interface RoomSearchSelectProps {
  rooms: Room[];
  value: string | null;
  onChange: (roomId: string) => void;
}

export function RoomSearchSelect({ rooms, value, onChange }: RoomSearchSelectProps) {
  return (
    <SimpleSelect
      label="Salle"
      placeholder="Choisir une salle..."
      options={rooms.map((r) => ({ value: r.id, label: `${r.name} (${r.capacity} places)` }))}
      value={value ?? undefined}
      onChange={(val) => {
        if (val) onChange(val);
      }}
      fullWidth
    />
  );
}
