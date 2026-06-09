import type { ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface ConfigItem {
  id: number;
  name: string;
}

interface ConfigCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  items: ConfigItem[];
  onAdd: () => void;
  onEdit: (item: ConfigItem) => void;
  onDelete: (item: ConfigItem) => void;
}

export function ConfigCard({
  title,
  description,
  icon,
  items,
  onAdd,
  onEdit,
  onDelete,
}: ConfigCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {icon} {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="size-4 mr-2" /> Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{item.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-8"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2">
              Aucun élément configuré.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
