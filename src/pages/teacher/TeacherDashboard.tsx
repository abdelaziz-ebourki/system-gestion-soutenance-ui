import { useMemo } from "react";
import { ClipboardCheck, Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { useTeacherStats, useTeacherSchedule, useTeacherEvaluations } from "@/hooks/use-queries";
import { DEFENSE_ROLE_LABELS } from "@/lib/constants";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

export default function TeacherDashboard() {
  const statsQuery = useTeacherStats();
  const scheduleQuery = useTeacherSchedule();
  const evaluationsQuery = useTeacherEvaluations();
  const stats = statsQuery.data ?? null;
  const schedule = scheduleQuery.data ?? [];
  const evaluations = evaluationsQuery.data ?? [];
  const isLoading = statsQuery.isLoading || scheduleQuery.isLoading || evaluationsQuery.isLoading;

  const upcomingDefenses = useMemo(() => schedule
    .filter((defense) => defense.status === "scheduled")
    .slice(0, 3), [schedule]);
  const pendingEvaluations = useMemo(() => evaluations.filter(
    (evaluation) => evaluation.status === "pending",
  ), [evaluations]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.4fr_1fr] md:px-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
              Session de soutenance
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Un espace enseignant clair pour suivre jurys, planning et notes.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Retrouvez vos passages à venir, les évaluations à rendre et vos
                indisponibilités depuis un point d'entrée unique.
              </p>
            </div>
          </div>

          <Card className="bg-secondary/40 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vue rapide</CardTitle>
              <CardDescription>
                Les indicateurs utiles avant le début des soutenances.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  À venir
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    stats?.upcomingDefenses
                  )}
                </p>
              </div>
              <div className="rounded-lg border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Notes
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    stats?.pendingEvaluations
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Soutenances à venir",
            value: stats?.upcomingDefenses,
            icon: Clock3,
          },
          {
            label: "Évaluations en attente",
            value: stats?.pendingEvaluations,
            icon: FileCheck2,
          },
          {
            label: "Créneaux bloqués",
            value: stats?.declaredUnavailabilitySlots,
            icon: ClipboardCheck,
          },
          {
            label: "Jurys assignés",
            value: stats?.juryAssignments,
            icon: ShieldCheck,
          },
        ].map((item) => (
          <Card key={item.label} >
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {isLoading ? <Skeleton className="h-9 w-14" /> : item.value}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-3 text-primary">
                <item.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card >
          <CardHeader>
            <CardTitle>Prochaines soutenances</CardTitle>
            <CardDescription>
              Les passages où votre présence est requise prochainement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDefenses.map((defense) => (
              <div key={defense.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{defense.projectTitle}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {defense.studentNames.join(", ")}
                    </p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">
                    {DEFENSE_ROLE_LABELS[defense.role]}
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {defense.date} · {defense.startTime} - {defense.endTime} ·{" "}
                  {defense.roomName}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card >
          <CardHeader>
            <CardTitle>Évaluations à rendre</CardTitle>
            <CardDescription>
              Les dossiers qui demandent encore une note ou un commentaire.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-lg border p-4">
                <p className="font-medium">{evaluation.projectTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {evaluation.studentNames.join(", ")}
                </p>
                <div className="mt-3">
                  <Badge variant="outline">{DEFENSE_ROLE_LABELS[evaluation.role]}</Badge>
                </div>
              </div>
            ))}
            {!isLoading && pendingEvaluations.length === 0 && (
              <div className="rounded-lg border bg-secondary p-4 text-sm text-secondary-foreground">
                Aucune évaluation en attente.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
