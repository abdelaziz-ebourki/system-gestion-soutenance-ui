import { useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";
import type { Jury } from "@/types";

interface DroppableCalendarCellProps {
  id: string;
  jury: Jury | null;
  onRemove: () => void;
}

export default function DroppableCalendarCell({ id, jury, onRemove }: DroppableCalendarCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <td
      ref={setNodeRef}
      className={`relative h-16 border p-1 transition-colors ${
        isOver ? "bg-primary/10 ring-2 ring-primary" : ""
      } ${jury ? "bg-primary/5" : ""}`}
    >
      {jury ? (
        <div className="group relative flex h-full items-center justify-between rounded bg-primary/10 px-2 text-xs">
          <span className="truncate font-medium">{jury.projectTitle}</span>
          <button
            onClick={onRemove}
            className="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
          >
            <X className="size-3 text-destructive" />
          </button>
        </div>
      ) : (
        <div className="h-full w-full" />
      )}
    </td>
  );
}
