import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, BuildingIcon } from "lucide-react";

import { useRooms, useDepartments } from "@/hooks/use-queries";
import type { Room } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useRoomCrud } from "@/hooks/entities/use-room-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

export default function Rooms() {
  const { data, isLoading, refetch } = useRooms();
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [batchDialog, setBatchDialog] = useState<"delete" | null>(null);
  const { data: departments = [] } = useDepartments();
  const crud = useRoomCrud();

  const columns = useMemo<ColumnDef<Room>[]>(() => {
    const getDepartmentName = (id: string) =>
      departments.find((d) => d.id === id)?.name || id;

    return [
      {
        accessorKey: "name",
        header: "Nom de la Salle",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "departmentId",
        header: "Département",
        cell: ({ row }) => (
          <div className="flex items-center text-muted-foreground">
            <BuildingIcon className="mr-2 size-4" />
            {getDepartmentName(row.getValue("departmentId"))}
          </div>
        ),
      },
      {
        accessorKey: "capacity",
        header: "Capacité",
        cell: ({ row }) => (
          <div className="font-mono">{row.getValue("capacity")} places</div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="text-right">
            <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />
          </div>
        ),
      },
    ];
  }, [crud, departments]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salles</h1>
          <p className="text-muted-foreground">Gérez les espaces physiques pour les soutenances.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog entity="room" triggerButtonText="Importation en masse" onSuccess={refetch} />
          <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
            <Button onClick={() => { crud.openCreate(); }}><Plus className="size-4" />Nouvelle Salle</Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{crud.selected ? "Modifier la salle" : "Ajouter une Salle"}</DialogTitle>
                <DialogDescription>
                  {crud.selected ? "Mettez à jour les informations de la salle." : "Créez une nouvelle salle pour les examens et soutenances."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={crud.handleSubmit}>
                <FieldGroup className="py-4">
                  <Field>
                    <FieldLabel>Nom de la Salle</FieldLabel>
                    <Input placeholder="ex: Salle 101" value={crud.formData.name}
                      onChange={(e) => crud.setFormData({ ...crud.formData, name: e.target.value })}
                      required error={crud.fieldErrors?.name} />
                  </Field>
                  <Field>
                    <FieldLabel>Département</FieldLabel>
                    <Select value={crud.formData.departmentId}
                      onValueChange={(v) => crud.setFormData({ ...crud.formData, departmentId: v || "" })}>
                      <SelectTrigger><SelectValue placeholder="Choisir un département" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {crud.fieldErrors?.departmentId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.departmentId}</p>}
                  </Field>
                  <Field>
                    <FieldLabel>Capacité (places)</FieldLabel>
                    <Input type="number" placeholder="ex: 30" value={crud.formData.capacity}
                      onChange={(e) => crud.setFormData({ ...crud.formData, capacity: Number(e.target.value) || 0 })}
                      required error={crud.fieldErrors?.capacity} />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => crud.setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" isLoading={crud.isPending} loadingText="Enregistrement...">Enregistrer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        <DataTable columns={columns} data={data ?? []} loading={isLoading} getRowId={(row) => row.id} enableRowSelection onSelectedRowsChange={setSelectedRooms} filterColumns="name" filterPlaceholder="Rechercher une salle..." />

      {selectedRooms.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">{selectedRooms.length} salle(s) sélectionnée(s)</span>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>Supprimer</Button>
          </div>
        </div>
      )}

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedRooms.length} salle(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedRooms.map((r) => crud.deleteMutation(r.id)));
            toast.success(`${selectedRooms.length} salle(s) supprimée(s)`);
            setSelectedRooms([]);
            setBatchDialog(null);
            refetch();
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={crud.isPending}
      />

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected?.name} isPending={crud.isPending} />
    </div>
  );
}
