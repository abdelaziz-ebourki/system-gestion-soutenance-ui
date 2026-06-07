import { useState } from "react";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import { ArrowRight, Calendar, ShieldCheck, Clock, FileText, CheckCircle2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { DefenseSession, DefenseSessionStatus, DefenseType } from "@/types";
import {
  useCoordinatorDefenseSessions,
  useTransitionDefenseSession,
  useCreateDefenseSession,
  useUpdateDefenseSession,
  useDeleteDefenseSession,
  useJuryRoleTemplates,
} from "@/hooks/queries";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Skeleton,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  DEFENSE_SESSION_STATUS_LABELS,
  DEFENSE_SESSION_STATUS_BADGE,
  DEFENSE_SESSION_LIFECYCLE,
  DEFENSE_TYPE_OPTIONS,
  DEFENSE_TYPE_SHORT_LABELS,
} from "@/lib/constants";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { CrudActions } from "@/components/admin/CrudActions";

const DEFAULT_DURATION_BY_TYPE: Record<DefenseType, number> = {
  pfe: 30,
  memoire: 20,
  these: 45,
};

const defaultForm = {
  name: "",
  defenseType: "pfe" as DefenseType,
  status: "draft" as DefenseSession["status"],
  maxGroupSize: 3,
  defenseDuration: 30,
  breakDuration: 15,
  submissionDeadline: "",
  juryRoleTemplateId: "",
  startDate: "",
  endDate: "",
  evaluationCoefficients: {} as Record<string, number>,
};

const formatSessionDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
};

const statusIcons: Record<string, typeof ShieldCheck> = {
  draft: FileText,
  active: Clock,
  scheduled: Calendar,
  completed: ShieldCheck,
  archived: CheckCircle2,
};

export default function CoordinatorDefenseSessions() {
  const { data: sessions = [], isLoading } = useCoordinatorDefenseSessions();
  const templatesQuery = useJuryRoleTemplates();
  const templates = templatesQuery.data ?? [];
  const createMutation = useCreateDefenseSession();
  const updateMutation = useUpdateDefenseSession();
  const deleteMutation = useDeleteDefenseSession();
  const transitionMutation = useTransitionDefenseSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DefenseSession | null>(null);
  const [editing, setEditing] = useState<DefenseSession | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (ds: DefenseSession) => {
    setEditing(ds);
    setForm({
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
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      toast.error("La date de début doit être antérieure à la date de fin");
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
        toast.success("Session de soutenance modifiée");
      } else {
        await createMutation.mutateAsync(form);
        toast.success("Session de soutenance créée");
      }
      setDialogOpen(false);
    } catch (error) {
      toastError(error, "Erreur lors de l'enregistrement");
    }
  };

  const handleTransition = async (id: string, toStatus: DefenseSessionStatus) => {
    setTransitioningId(id);
    try {
      await transitionMutation.mutateAsync({ id, toStatus });
      toast.success(`Session passée en "${DEFENSE_SESSION_STATUS_LABELS[toStatus]}"`);
    } catch (error) {
      toastError(error, "Transition impossible");
    } finally {
      setTransitioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="coord-sessions-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions de soutenance</h1>
          <p className="text-muted-foreground">
            Gérez le cycle de vie de vos sessions : création, activation, planification, clôture et archivage.
          </p>
        </div>
        <Button onClick={openCreate} data-testid="coord-sessions-add-button">
          <Plus className="mr-2 size-4" />
          Nouvelle session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          variant="card"
          description="Aucune session de soutenance pour le moment."
        />
       ) : (
         <div className="grid gap-6 md:grid-cols-2">
           {sessions?.map((session) => {
            const StatusIcon = statusIcons[session.status] || ShieldCheck;
            const nextStates = DEFENSE_SESSION_LIFECYCLE[session.status] ?? [];

            return (
              <Card key={session.id} className="relative overflow-hidden" data-testid={`coord-sessions-card-${session.id}`}>
                <div className="absolute right-0 top-0 h-1 w-full bg-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="size-4 text-primary" />
                        {session.name}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mr-2">
                          {DEFENSE_TYPE_SHORT_LABELS[session.defenseType] ?? session.defenseType}
                        </Badge>
                        {session.defenseDuration} min par passage · {session.breakDuration} min de pause
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={DEFENSE_SESSION_STATUS_BADGE[session.status] ?? "secondary"} className="rounded-md capitalize">
                        {DEFENSE_SESSION_STATUS_LABELS[session.status]}
                      </Badge>
                      <CrudActions
                        entity={session}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Max groupe</p>
                      <p className="font-medium">{session.maxGroupSize} étudiants</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Dépôt avant</p>
                      <p className="font-medium">{formatSessionDate(session.submissionDeadline)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Début</p>
                      <p className="font-medium">
                        <Calendar className="mr-1 inline size-3" />
                        {formatSessionDate(session.startDate)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <p className="font-medium">
                        <Calendar className="mr-1 inline size-3" />
                        {formatSessionDate(session.endDate)}
                      </p>
                    </div>
                  </div>

                  {nextStates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {nextStates.map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleTransition(session.id, next as DefenseSessionStatus)
                          }
                          isLoading={transitioningId === session.id}
                          className="gap-1"
                        >
                          {DEFENSE_SESSION_STATUS_LABELS[next]}
                          <ArrowRight className="size-3" />
                        </Button>
                      ))}
                    </div>
                  )}

                  {session.status === "archived" && (
                    <p className="text-xs text-muted-foreground">
                      Session archivée — toutes les données sont en lecture seule.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="coord-sessions-dialog">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier" : "Créer"} une session de soutenance</DialogTitle>
            <DialogDescription>
              Configurez les règles et paramètres de la session.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4 py-4">
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  data-testid="coord-sessions-input-name"
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
                  <SelectTrigger data-testid="coord-sessions-input-defense-type">
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
                    data-testid="coord-sessions-input-duration"
                  />
                </Field>
                <Field>
                  <FieldLabel>Pause (min)</FieldLabel>
                  <Input
                    type="number"
                    value={form.breakDuration}
                    onChange={(e) => setForm({ ...form, breakDuration: Number(e.target.value) })}
                    min={0}
                    data-testid="coord-sessions-input-break"
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
                    data-testid="coord-sessions-input-max-group"
                  />
                </Field>
                <Field>
                  <FieldLabel>Date limite dépôt</FieldLabel>
                  <Input
                    type="date"
                    value={form.submissionDeadline}
                    onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
                    data-testid="coord-sessions-input-deadline"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Modèle de jury</FieldLabel>
                <Select
                  value={form.juryRoleTemplateId}
                  onValueChange={(v) => {
                    const tpl = templates.find((t) => t.id === v);
                    const coeffs: Record<string, number> = {};
                    if (tpl) {
                      for (const role of tpl.roles) {
                        coeffs[role.name] = role.coefficient;
                      }
                    }
                    setForm({ ...form, juryRoleTemplateId: v ?? "", evaluationCoefficients: coeffs });
                  }}
                >
                  <SelectTrigger data-testid="coord-sessions-input-template"><SelectValue placeholder="Choisir un modèle" /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Coefficients d'évaluation</FieldLabel>
                <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                  {Object.keys(form.evaluationCoefficients).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(form.evaluationCoefficients).map(([role, coeff]) => (
                        <span key={role} className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-medium">
                          {role}: {coeff}%
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sélectionnez un modèle de jury</span>
                  )}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Date début</FieldLabel>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                    data-testid="coord-sessions-input-start"
                  />
                </Field>
                <Field>
                  <FieldLabel>Date fin</FieldLabel>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    required
                    data-testid="coord-sessions-input-end"
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="coord-sessions-dialog-cancel">
                Annuler
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} data-testid="coord-sessions-dialog-submit">
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
          } catch (error) {
            toastError(error, "Erreur lors de la suppression");
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

