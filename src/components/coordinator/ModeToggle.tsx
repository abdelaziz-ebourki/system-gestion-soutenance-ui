import { GripVertical, MousePointerClick } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui";

export type ScheduleMode = "click" | "dnd";

interface ModeToggleProps {
  value: ScheduleMode;
  onChange: (value: ScheduleMode) => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val as ScheduleMode);
      }}
      variant="outline"
      spacing={0}
      size="sm"
    >
      <ToggleGroupItem value="click" className="gap-2">
        <MousePointerClick className="size-4" />
        Placement rapide
      </ToggleGroupItem>
      <ToggleGroupItem value="dnd" className="gap-2">
        <GripVertical className="size-4" />
        Glisser-déposer
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
