import { useMemo } from "react";
import { FileCheck2, MessageSquareText, PencilLine } from "lucide-react";

import { useTeacherEvaluations } from "@/hooks/use-queries";
import { useEvaluationForm } from "@/hooks/use-evaluation-form";
import { DEFENSE_ROLE_LABELS } from "@/lib/constants";
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
  Input,
  Label,
  Skeleton,
  Textarea,
  StatsCard,
} from "@/components/ui";

export default function TeacherEvaluations() {
  const evaluationsQuery = useTeacherEvaluations();
  const evaluations = evaluationsQuery.data ?? [];
  const isLoading = evaluationsQuery.isLoading;

  const form = useEvaluationForm();

  const pendingEvaluations = useMemo(() => evaluations.filter(
    (evaluation) => evaluation.status === "pending",
  ), [evaluations]);
  const submittedEvaluations = useMemo(() => evaluations.filter(
    (evaluation) => evaluation.status === "submitted",
  ), [evaluations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Évaluations</h1>
        <p className="text-muted-foreground">
          Gérez les notes et les appréciations des soutenances.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="À compléter" value={pendingEvaluations.length} icon={PencilLine} />
        <StatsCard label="Soumises" value={submittedEvaluations.length} icon={FileCheck2} />
        <StatsCard label="Commentaires" value={evaluations.filter((e) => e.comment).length} icon={MessageSquareText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évaluations en attente</CardTitle>
            <CardDescription>
              Saisissez une note et une appréciation pour chaque dossier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              pendingEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{evaluation.projectTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {evaluation.studentNames.join(", ")}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {DEFENSE_ROLE_LABELS[evaluation.role]}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => form.openEdit(evaluation)}>
                      Saisir l'évaluation
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique récent</CardTitle>
            <CardDescription>
              Les évaluations déjà transmises au système.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submittedEvaluations.length > 0 ? (
              submittedEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{evaluation.projectTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Note: {evaluation.score}/20
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {DEFENSE_ROLE_LABELS[evaluation.role]}
                  </Badge>
                </div>
                {evaluation.comment && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {evaluation.comment}
                  </p>
                )}
              </div>
            ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucune évaluation soumise.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={form.isDialogOpen}
        onOpenChange={form.setIsDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Compléter une évaluation</DialogTitle>
            <DialogDescription>
              Enregistrez votre note et votre appréciation pour ce dossier.
            </DialogDescription>
          </DialogHeader>
          <form
            id="teacher-evaluation-form"
            className="grid gap-4"
            onSubmit={form.handleSubmit}
          >
            <div className="rounded-lg border bg-secondary/40 p-4">
              <p className="font-medium">{form.selected?.projectTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {form.selected?.studentNames.join(", ")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-score">Note / 20</Label>
              <Input
                id="teacher-score"
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={String(form.formData.score)}
                onChange={(event) => form.setFormData({ ...form.formData, score: Number(event.target.value) })}
                required
                error={form.fieldErrors?.score}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-comment">Appréciation</Label>
              <Textarea
                id="teacher-comment"
                value={form.formData.comment}
                onChange={(event) => form.setFormData({ ...form.formData, comment: event.target.value })}
                className="min-h-28"
                required
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              form="teacher-evaluation-form"
              isLoading={form.isPending}
              loadingText="Enregistrement..."
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
