import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";

interface CrudActionsProps<TEntity> {
  entity: TEntity;
  onEdit: (entity: TEntity) => void;
  onDelete: (entity: TEntity) => void;
}

export function CrudActions<TEntity>({
  entity,
  onEdit,
  onDelete,
}: CrudActionsProps<TEntity>) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0" data-testid="crud-actions-trigger">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(entity)} data-testid="crud-actions-edit">
            <Pencil className="mr-2 size-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(entity)}
            data-testid="crud-actions-delete"
          >
            <Trash2 className="mr-2 size-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
