import { Search, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
} from "@/components/ui";
import DraggableJurySlot from "@/components/coordinator/DraggableJurySlot";
import type { Jury } from "@/types";

interface JurySidebarProps {
  juries: Jury[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function JurySidebar({
  juries,
  searchQuery,
  onSearchChange,
}: JurySidebarProps) {
  return (
    <Card className="col-span-3 h-[calc(100vh-12rem)] flex flex-col" data-testid="coord-designer-jury-sidebar">
      <CardHeader className="pb-3">
<CardTitle className="text-lg flex items-center gap-2">
  <Users className="size-5" /> À positionner
  <Badge variant="secondary" className="ml-auto" data-testid="coord-designer-jury-count">{juries.length}</Badge>
</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un jury..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="coord-designer-jury-search"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3 pt-0" data-testid="coord-designer-jury-list">
        {juries.map((jury) => (
          <DraggableJurySlot key={jury.id} jury={jury} />
        ))}
        {juries.length === 0 && (
          <div className="text-center py-10 text-muted-foreground italic text-sm">
            Aucun jury en attente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
