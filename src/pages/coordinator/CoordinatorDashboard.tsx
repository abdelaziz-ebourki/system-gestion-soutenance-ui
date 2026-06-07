import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Sparkles,
  Users,
} from "lucide-react";

import { useCoordinatorStats, useProjects, useJuries } from "@/hooks/queries";

import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  StatsCard,
} from "@/components/ui";

const actionCards = [
  {
    title: "Projets & Groupes",
    description: "Affectations, encadrants et suivi des depots.",
    to: "/coordinator/projects",
    icon: BookOpen,
  },
  {
    title: "Jurys",
    description: "Composer les jurys et équilibrer les rôles.",
    to: "/coordinator/juries",
    icon: Users,
  },
  {
    title: "Planification",
    description: "Orchestrer les salles, créneaux et passages.",
    to: "/coordinator/schedule",
    icon: CalendarDays,
  },
];

export default function CoordinatorDashboard() {
  const statsQuery = useCoordinatorStats();
  const projectsQuery = useProjects();
  const juriesQuery = useJuries();
  const stats = statsQuery.data;
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const juries = useMemo(() => juriesQuery.data ?? [], [juriesQuery.data]);
  const isLoading = statsQuery.isLoading || projectsQuery.isLoading || juriesQuery.isLoading;

  const readyProjects = useMemo(() => projects.filter(
    (project) => project.status === "approved",
  ), [projects]);
  const projectsWithoutJury = useMemo(() => projects.filter(
    (project) => !juries.some((jury) => jury.projectId === project.id),
  ), [projects, juries]);
  const juryCoverage = useMemo(() =>
    projects.length > 0
      ? Math.round((juries.length / projects.length) * 100)
      : 0,
  [projects.length, juries.length]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="coord-dashboard-page">
      <section className="overflow-hidden rounded-3xl border bg-card shadow-sm" data-testid="coord-dashboard-hero">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.5fr_1fr] md:px-8">
          <div className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              Campagne de soutenance {new Date().getFullYear()}
            </Badge>
            <div className="space-y-2">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Coordination des soutenances, pensee comme une salle de
                contrôle.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Suivez la progression des projets, la couverture des jurys et la
                preparation du planning depuis un seul point d'entree.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/coordinator/schedule"
                className={buttonVariants({ size: "lg" })}
                data-testid="coord-dashboard-open-planner"
              >
                Ouvrir le planificateur
              </Link>
              <Link
                to="/coordinator/juries"
                className={buttonVariants({ variant: "outline", size: "lg" })}
                data-testid="coord-dashboard-check-juries"
              >
                Verifier les jurys
              </Link>
            </div>
          </div>

          <Card className="bg-secondary/40 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Etat de preparation
              </CardTitle>
              <CardDescription>
                Les points qui demandent encore une intervention.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-background/80 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Couverture des jurys</span>
                  <span>{juryCoverage}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${Math.min(juryCoverage, 100)}%` }}
                      data-testid="coord-dashboard-jury-coverage"
                    />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Prêts
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      readyProjects.length
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Projets approuves
                  </p>
                </div>
                <div className="rounded-lg border bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    A completer
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      projectsWithoutJury.length
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Projets sans jury
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-testid="coord-dashboard-stats">
        <StatsCard label="Projets" value={stats?.totalProjects} icon={BookOpen} />
        <StatsCard label="Groupes" value={stats?.totalGroups} icon={Users} />
        <StatsCard label="Jurys" value={stats?.totalJuries} icon={ClipboardCheck} />
        <StatsCard label="Créneaux planifiés" value={stats?.scheduledDefenses} icon={Clock3} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card data-testid="coord-dashboard-quick-access">
          <CardHeader>
            <CardTitle>Acces directs</CardTitle>
            <CardDescription>
              Des points d'entree clairs pour boucler la campagne plus vite.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {actionCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-secondary p-3 text-primary">
                  <card.icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-semibold">{card.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-foreground">
                  Ouvrir
                  <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card data-testid="coord-dashboard-attention-points">
          <CardHeader>
            <CardTitle>Points d'attention</CardTitle>
            <CardDescription>
              Les dossiers qui bloquent le passage a la planification finale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsWithoutJury.slice(0, 4).map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-dashed p-4"
              >
                <p className="font-medium">{project.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Encadrant: {project.supervisorName}
                </p>
              </div>
            ))}
            {!isLoading && projectsWithoutJury.length === 0 && (
              <EmptyState variant="card" description="Tous les projets disposent déjà d'un jury." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

