import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Plus, Calendar } from "lucide-react";

import type { DefenseSession, DefenseType } from "@/types";
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
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  DEFENSE_SESSION_STATUS_LABELS,
  DEFENSE_SESSION_STATUS_BADGE,
  DEFENSE_TYPE_OPTIONS,
  DEFENSE_TYPE_SHORT_LABELS,
} from "@/lib/constants";
import {
  useDefenseSessions,
  useSessions,
  useCreateDefenseSession,
  useUpdateDefenseSession,
  useDeleteDefenseSession,
} from "@/hooks/use-queries";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { CrudActions } from "@/components/admin/CrudActions";

const DEFAULT_DURATION_BY_TYPE: Record<DefenseType, number> = {
  pfe: 30,
  memoire: 20,
  these: 45,
};

const defaultForm = {
  globalSessionId: "",
  name: "",
  defenseType: "pfe" as DefenseType,
  status: "draft" as DefenseSession["status"],
  maxGroupSize: 3,
  defenseDuration: 30,
  breakDuration: 15,
  submissionDeadline: "",
  juryRoleTemplateId: "jt1",
  startDate: "",
  endDate: "",
  evaluationCoefficients: {} as Record<string, number>,
};

export default function DefenseSessionsPage() {
  const { data, isLoading } = useDefenseSessions();
  const sessionsQuery = useSessions();
  const globalSessions = sessionsQuery.data ?? [];
  const createMutation = useCreateDefenseSession();
  const updateMutation = useUpdateDefenseSession();
  const deleteMutation = useDeleteDefenseSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DefenseSession | null>(null);
  const [editing, setEditing] = useState<DefenseSession | null>(null);
  const [form, setForm] = useState(defaultForm);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultForm, globalSessionId: globalSessions[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (ds: DefenseSession) => {
    setEditing(ds);
    setForm({
      globalSessionId: ds.globalSessionId,
      name: ds.name,
      defenseType: ds.defenseType,
      status: ds.status,
      maxGroupSize: ds.maxGroupSize,
      defenseDuration: ds.defenseDuration,
      breakDuration: ds.breakDuration,
      submissionDeadline: ds.submissionDeadline,
      juryRoleTemplateId: ds.juryRoleTemplateId,
      startDate: ds.startDate,
      endDate: ds.endDate,
      evaluationCoefficients: ds.evaluationCoefficients,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
        toast.success("Session de soutenance modifiée");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Session de soutenance créée");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const columns = useMemo<ColumnDef<DefenseSession>[]>(() => [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "defenseType",
      header: "Type",
      cell: ({ row }) => {
        const t = row.getValue("defenseType") as DefenseType;
        return <Badge variant="outline">{DEFENSE_TYPE_SHORT_LABELS[t] ?? t}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={DEFENSE_SESSION_STATUS_BADGE[status] ?? "secondary"} className="rounded-md capitalize">
            {DEFENSE_SESSION_STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "defenseDuration",
      header: "Durée",
      cell: ({ row }) => <span>{row.getValue("defenseDuration")} min</span>,
    },
    {
      accessorKey: "maxGroupSize",
      header: "Max groupe",
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
      cell: ({ row }) => (
        <div className="text-right">
          <CrudActions
            entity={row.original}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      ),
    },
  ], []);

  if (globalSessions.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Calendar}
          title="Aucune session globale configurée"
          description="Vous devez d'abord configurer au moins une session globale avant de pouvoir créer des sessions de soutenance."
          action={<Button asChild><Link to="/admin/configuration">Configurer</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions de soutenance</h1>
          <p className="text-muted-foreground">
            Gérez les sessions de soutenance associées aux sessions globales.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Nouvelle session
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        loading={isLoading}
        getRowId={(row) => row.id}
        filterColumns="name"
        filterPlaceholder="Rechercher..."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier" : "Créer"} une session de soutenance</DialogTitle>
            <DialogDescription>
              Configurez les règles et paramètres de la session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4 py-4">
              <Field>
                <FieldLabel>Session globale</FieldLabel>
                <Select
                  value={form.globalSessionId}
                  onValueChange={(v) => setForm({ ...form, globalSessionId: v ?? "" })}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {globalSessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Type de soutenance</FieldLabel>
                <Select
                  value={form.defenseType}
                  onValueChange={(v) => {
                    const type = v as DefenseType;
                    setForm({
                      ...form,
                      defenseType: type,
                      defenseDuration: DEFAULT_DURATION_BY_TYPE[type],
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFENSE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Durée de passage (min)</FieldLabel>
                  <Input
                    type="number"
                    value={form.defenseDuration}
                    onChange={(e) => setForm({ ...form, defenseDuration: Number(e.target.value) })}
                    min={5}
                    max={180}
                  />
                </Field>
                <Field>
                  <FieldLabel>Pause (min)</FieldLabel>
                  <Input
                    type="number"
                    value={form.breakDuration}
                    onChange={(e) => setForm({ ...form, breakDuration: Number(e.target.value) })}
                    min={0}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Max étudiants/groupe</FieldLabel>
                  <Input
                    type="number"
                    value={form.maxGroupSize}
                    onChange={(e) => setForm({ ...form, maxGroupSize: Number(e.target.value) })}
                    min={1}
                    max={10}
                  />
                </Field>
                <Field>
                  <FieldLabel>Date limite dépôt</FieldLabel>
                  <Input
                    type="date"
                    value={form.submissionDeadline}
                    onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Coefficients d'évaluation (JSON)</FieldLabel>
                <Input
                  value={JSON.stringify(form.evaluationCoefficients)}
                  onChange={(e) => {
                    try {
                      setForm({ ...form, evaluationCoefficients: JSON.parse(e.target.value) });
                    } catch { /* invalid JSON, ignore */ }
                  }}
                  placeholder='{"rapport": 0.4, "presentation": 0.3, "soutenance": 0.3}'
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Date début</FieldLabel>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>Date fin</FieldLabel>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        entityName={deleteTarget?.name}
        onDelete={async () => {
          if (!deleteTarget) return;
          try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            toast.success("Session de soutenance supprimée");
            setDeleteTarget(null);
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
