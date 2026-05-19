"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  BuildingIcon,
} from "lucide-react";

import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks/use-queries";
import type { Room } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
  Skeleton,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { validate, roomSchema } from "@/lib/validations";

export default function Rooms() {
  const { data, isLoading, refetch } = useRooms();
  const createRoomMut = useCreateRoom();
  const updateRoomMut = useUpdateRoom();
  const deleteRoomMut = useDeleteRoom();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);

  // Form state
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState({
    name: "",
    capacity: 0,
    building: "",
  });

  const resetForm = () => {
    setFormData({ name: "", capacity: 0, building: "" });
    setSelectedRoom(null);
    setFieldErrors({});
  };

  const handleCreateRoom = async () => {
    const errors = validate(roomSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await createRoomMut.mutateAsync(formData);
      toast.success("Salle ajoutée avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de la création de la salle");
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    const errors = validate(roomSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      await updateRoomMut.mutateAsync({ id: selectedRoom.id, data: formData });
      toast.success("Salle modifiée avec succès");
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de la modification de la salle");
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (selectedRoom) {
      handleUpdateRoom();
    } else {
      handleCreateRoom();
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoomMut.mutateAsync(selectedRoom.id);
      toast.success("Salle supprimée");
      setIsDeleteDialogOpen(false);
      setSelectedRoom(null);
    } catch {
      toast.error("Erreur lors de la suppression de la salle");
    }
  };

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "name",
      header: "Nom de la Salle",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "building",
      header: "Bâtiment",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground">
          <BuildingIcon className="mr-2 h-4 w-4" />
          {row.getValue("building")}
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
      header: "Action",
      cell: ({ row }) => {
        const room = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedRoom(room);
                    setFormData({
                      name: room.name,
                      capacity: room.capacity,
                      building: room.building,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salles</h1>
          <p className="text-muted-foreground">
            Gérez les espaces physiques pour les soutenances.
          </p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog
            entity="room"
            triggerButtonText="Importation en masse"
            onSuccess={refetch}
          />
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger
              render={
                <Button>
                  <Plus className="h-4 w-4" />
                  Nouvelle Salle
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedRoom ? "Modifier la salle" : "Ajouter une Salle"}
                </DialogTitle>
                <DialogDescription>
                  {selectedRoom
                    ? "Mettez à jour les informations de la salle."
                    : "Créez une nouvelle salle pour les examens et soutenances."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <FieldGroup className="py-4">
                  <Field>
                    <FieldLabel>Nom de la Salle</FieldLabel>
                    <Input
                      placeholder="ex: Salle 101"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      error={fieldErrors?.name}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Bâtiment</FieldLabel>
                    <Input
                      placeholder="ex: Bloc A"
                      value={formData.building}
                      onChange={(e) =>
                        setFormData({ ...formData, building: e.target.value })
                      }
                      required
                      error={fieldErrors?.building}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Capacité (places)</FieldLabel>
                    <Input
                      type="number"
                      placeholder="ex: 30"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      error={fieldErrors?.capacity}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    isLoading={selectedRoom ? updateRoomMut.isPending : createRoomMut.isPending}
                    loadingText="Enregistrement..."
                  >
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La salle "{selectedRoom?.name}"
              sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              variant="destructive"
              isLoading={deleteRoomMut.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          filterColumn="name"
          filterPlaceholder="Rechercher une salle..."
        />
      )}
    </div>
  );
}
