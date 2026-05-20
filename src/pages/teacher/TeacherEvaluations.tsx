import { useMemo } from "react";
import * as React from "react";
import { FileCheck2, MessageSquareText, PencilLine } from "lucide-react";

import { useTeacherEvaluations, useSubmitTeacherEvaluation } from "@/hooks/use-queries";
import { validate, evaluationSchema } from "@/lib/validations";
import type { TeacherEvaluation } from "@/types";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
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
  Textarea,
} from "@/components/ui";



export default function TeacherEvaluations() {
  const evaluationsQuery = useTeacherEvaluations();
  const submitMutation = useSubmitTeacherEvaluation();
  const evaluations = evaluationsQuery.data ?? [];
  const isLoading = evaluationsQuery.isLoading;
  const [selectedEvaluation, setSelectedEvaluation] =
    React.useState<TeacherEvaluation | null>(null);
  const [score, setScore] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const openEvaluation = (evaluation: TeacherEvaluation) => {
    setSelectedEvaluation(evaluation);
    setScore(evaluation.score?.toString() || "");
    setComment(evaluation.comment || "");
  };

  const closeEvaluation = () => {
    setSelectedEvaluation(null);
    setScore("");
    setComment("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedEvaluation) {
      return;
    }

    const errors = validate(evaluationSchema, {
      score: Number(score),
      comment,
    });

    if (errors) {
      setFieldErrors(errors);
      return;
    }

    try {
      await submitMutation.mutateAsync({
        id: selectedEvaluation.id,
        data: {
          score: Number(score),
          comment,
        },
      });
      setFieldErrors({});
      toast.success("Évaluation enregistrée");
      closeEvaluation();
    } catch (error) {
      toastError(error, "Erreur lors de l'enregistrement");
    }
  };

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
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">À compléter</p>
              <p className="mt-2 text-3xl font-semibold">
                {pendingEvaluations.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <PencilLine className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Soumises</p>
              <p className="mt-2 text-3xl font-semibold">
                {submittedEvaluations.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <FileCheck2 className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Commentaires</p>
              <p className="mt-2 text-3xl font-semibold">
                {evaluations.filter((evaluation) => evaluation.comment).length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <MessageSquareText className="size-5" />
            </div>
          </CardContent>
        </Card>
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
              <div className="py-10 text-center text-sm text-muted-foreground">
                Chargement des évaluations...
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
                    <Button onClick={() => openEvaluation(evaluation)}>
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
        open={Boolean(selectedEvaluation)}
        onOpenChange={(open) => {
          if (!open) {
            closeEvaluation();
          }
        }}
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
            onSubmit={handleSubmit}
          >
            <div className="rounded-lg border bg-secondary/40 p-4">
              <p className="font-medium">{selectedEvaluation?.projectTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedEvaluation?.studentNames.join(", ")}
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
                value={score}
                onChange={(event) => setScore(event.target.value)}
                required
                error={fieldErrors?.score}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-comment">Appréciation</Label>
              <Textarea
                id="teacher-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-28"
                required
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="submit"
              form="teacher-evaluation-form"
              isLoading={submitMutation.isPending}
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
