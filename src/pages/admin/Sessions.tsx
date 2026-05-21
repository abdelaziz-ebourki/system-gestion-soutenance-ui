import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Calendar } from "lucide-react";

import type { Session } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Badge,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useSessionCrud } from "@/hooks/entities/use-session-crud";
import { useSessions } from "@/hooks/use-queries";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { CrudActions } from "@/components/admin/CrudActions";

const statusBadge: Record<string, "default" | "secondary"> = {
  active: "default",
  draft: "secondary",
  archived: "secondary",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  draft: "Brouillon",
  archived: "Archivée",
};

export default function Sessions() {
  const { data, isLoading, refetch } = useSessions();
  const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);
  const [batchDialog, setBatchDialog] = useState<"status" | "delete" | null>(null);
  const [batchValue, setBatchValue] = useState("");
  const crud = useSessionCrud();

  const columns = useMemo<ColumnDef<Session>[]>(() => [
    { accessorKey: "name", header: "Nom de la Session", cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline" className="rounded-md">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={statusBadge[status] ?? "secondary"} className="rounded-md capitalize">{statusLabel[status] ?? status}</Badge>;
      },
    },
    {
      accessorKey: "startDate",
      header: "Début",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground">
          <Calendar className="mr-2 size-3" />
          {row.getValue("startDate")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "Fin",
      cell: ({ row }) => (
        <div className="flex items-center text-muted-foreground">
          <Calendar className="mr-2 size-3" />
          {row.getValue("endDate")}
        </div>
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
  ], [crud]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions Globales</h1>
          <p className="text-muted-foreground">Définissez les périodes académiques pour les soutenances.</p>
        </div>
        <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
          <Button onClick={() => { crud.openCreate(); }}><Plus className="mr-2 size-4" />Nouvelle Session</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.selected ? "Modifier la session" : "Créer une Session"}</DialogTitle>
              <DialogDescription>
                {crud.selected ? "Mettez à jour les informations de la session." : "Configurez une nouvelle période de soutenance."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={crud.handleSubmit}>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Nom de la Session</FieldLabel>
                  <Input placeholder="ex: Session Normale 2026" value={crud.formData.name}
                    onChange={(e) => crud.setFormData({ ...crud.formData, name: e.target.value })}
                    required error={crud.fieldErrors?.name} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select value={crud.formData.type}
                      onValueChange={(val) => crud.setFormData({ ...crud.formData, type: val ?? "Normale" })}>
                      <SelectTrigger><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normale">Normale</SelectItem>
                        <SelectItem value="Rattrapage">Rattrapage</SelectItem>
                        <SelectItem value="Spéciale">Spéciale</SelectItem>
                      </SelectContent>
                    </Select>
                    {crud.fieldErrors?.type && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.type}</p>}
                  </Field>
                  <Field>
                    <FieldLabel>Statut Initial</FieldLabel>
                    <Select value={crud.formData.status === "active" ? "Active" : crud.formData.status === "draft" ? "Brouillon" : "Archivée"}
                      onValueChange={(val) => crud.setFormData({
                        ...crud.formData,
                        status: val === "Active" ? "active" : val === "Brouillon" ? "draft" : "archived",
                      })}>
                      <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brouillon">Brouillon</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Archivée">Archivée</SelectItem>
                      </SelectContent>
                    </Select>
                    {crud.fieldErrors?.status && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.status}</p>}
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Date de début</FieldLabel>
                    <Input type="date" value={crud.formData.startDate}
                      onChange={(e) => crud.setFormData({ ...crud.formData, startDate: e.target.value })}
                      required error={crud.fieldErrors?.startDate} />
                  </Field>
                  <Field>
                    <FieldLabel>Date de fin</FieldLabel>
                    <Input type="date" value={crud.formData.endDate}
                      onChange={(e) => crud.setFormData({ ...crud.formData, endDate: e.target.value })}
                      required error={crud.fieldErrors?.endDate} />
                  </Field>
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => crud.setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" isLoading={crud.isPending} loadingText="Enregistrement...">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

        <DataTable columns={columns} data={data ?? []} loading={isLoading} getRowId={(row) => row.id} enableRowSelection onSelectedRowsChange={setSelectedSessions} filterColumns="name" filterPlaceholder="Rechercher une session..."
          filters={[
            { column: "type", label: "Type", options: [{ value: "Normale", label: "Normale" }, { value: "Rattrapage", label: "Rattrapage" }, { value: "Spéciale", label: "Spéciale" }] },
            { column: "status", label: "Statut", options: [{ value: "active", label: "Active" }, { value: "draft", label: "Brouillon" }, { value: "archived", label: "Archivée" }] },
          ]} />

      {selectedSessions.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">{selectedSessions.length} session(s) sélectionnée(s)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setBatchDialog("status"); setBatchValue(""); }}>
              Changer le statut
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={batchDialog === "status"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>{selectedSessions.length} session(s) sélectionnée(s).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="archived">Archivée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
            <Button onClick={async () => {
              if (!batchValue) return;
              try {
                await Promise.all(selectedSessions.map((s) => crud.updateMutation(s.id, { status: batchValue as Session["status"] })));
                toast.success(`${selectedSessions.length} session(s) mise(s) à jour`);
                setSelectedSessions([]);
                setBatchDialog(null);
                refetch();
              } catch {
                toast.error("Erreur lors de la mise à jour");
              }
            }} isLoading={crud.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedSessions.length} session(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedSessions.map((s) => crud.deleteMutation(s.id)));
            toast.success(`${selectedSessions.length} session(s) supprimée(s)`);
            setSelectedSessions([]);
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
