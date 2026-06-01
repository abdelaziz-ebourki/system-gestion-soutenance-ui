import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Users } from "lucide-react";
import type { Jury } from "@/types";
import { Badge } from "@/components/ui";

interface DraggableJurySlotProps {
  jury: Jury;
  isOverlay?: boolean;
}

export default function DraggableJurySlot({ jury, isOverlay }: DraggableJurySlotProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: jury.id,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-3 ${
        isDragging ? "opacity-30" : ""
      } ${isOverlay ? "shadow-lg" : "cursor-grab hover:border-primary/40"}`}
      data-testid={`coord-jury-slot-${jury.id}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {!isOverlay && (
          <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium" data-testid={`coord-jury-slot-title-${jury.id}`}>{jury.projectTitle}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`coord-jury-slot-students-${jury.id}`}>
            <Users className="size-3" />
            <span>{jury.studentNames?.join(", ") ?? "—"}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {jury.members.map((m) => (
          <Badge key={m.teacherId} variant="outline" className="text-[10px]" data-testid={`coord-jury-slot-member-${jury.id}-${m.teacherId}`}>
            {m.teacherName}
          </Badge>
        ))}
      </div>
    </div>
  );
}
