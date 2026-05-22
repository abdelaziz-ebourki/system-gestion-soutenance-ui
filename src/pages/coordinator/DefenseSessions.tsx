import { toast } from "sonner";
import { ArrowRight, Calendar, ShieldCheck, Clock, FileText, CheckCircle2 } from "lucide-react";

import type { DefenseSessionStatus } from "@/types";
import { useCoordinatorDefenseSessions, useTransitionDefenseSession } from "@/hooks/use-queries";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import {
  DEFENSE_SESSION_STATUS_LABELS,
  DEFENSE_SESSION_LIFECYCLE,
} from "@/lib/constants";

const statusIcons: Record<string, typeof ShieldCheck> = {
  draft: FileText,
  active: Clock,
  scheduled: Calendar,
  completed: ShieldCheck,
  archived: CheckCircle2,
};

export default function CoordinatorDefenseSessions() {
  const { data: sessions = [], isLoading } = useCoordinatorDefenseSessions();
  const transitionMutation = useTransitionDefenseSession();

  const handleTransition = async (id: string, toStatus: DefenseSessionStatus) => {
    try {
      await transitionMutation.mutateAsync({ id, toStatus });
      toast.success(`Session passée en "${DEFENSE_SESSION_STATUS_LABELS[toStatus]}"`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Transition impossible");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions de soutenance</h1>
        <p className="text-muted-foreground">
          Gérez le cycle de vie de vos sessions : activation, planification, clôture et archivage.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          variant="card"
          description="Aucune session de soutenance pour le moment."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sessions.map((session) => {
            const StatusIcon = statusIcons[session.status] || ShieldCheck;
            const nextStates = DEFENSE_SESSION_LIFECYCLE[session.status] ?? [];

            return (
              <Card key={session.id} className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-1 w-full bg-primary" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="size-4 text-primary" />
                        {session.name}
                      </CardTitle>
                      <CardDescription>
                        {session.defenseDuration} min par passage · {session.breakDuration} min de pause
                      </CardDescription>
                    </div>
                    <Badge>
                      {DEFENSE_SESSION_STATUS_LABELS[session.status]}
                    </Badge>
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
                      <p className="font-medium">{session.submissionDeadline}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Début</p>
                      <p className="font-medium">
                        <Calendar className="mr-1 inline size-3" />
                        {session.startDate}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <p className="font-medium">
                        <Calendar className="mr-1 inline size-3" />
                        {session.endDate}
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
                          isLoading={transitionMutation.isPending}
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
    </div>
  );
}
