
import { CalendarDays, GraduationCap, Users, Printer, Download } from "lucide-react";

import { useStudentStats, useStudentDefense } from "@/hooks/queries";
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  StatsCard,
} from "@/components/ui";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { data: stats } = useStudentStats();
  const { data: defense, isLoading: isDefenseLoading } = useStudentDefense();
  const isLoading = isDefenseLoading;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.35fr_1fr] md:px-8">
          <div className="space-y-4">
            <Badge className="w-fit" variant="secondary" data-testid="student-dashboard-hero-badge">
              Ma soutenance
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl" data-testid="student-dashboard-hero-title">
                Toutes les informations utiles à votre soutenance, au même
                endroit.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base" data-testid="student-dashboard-hero-description">
                Consultez votre planning, votre jury, vos documents et votre
                convocation sans passer par plusieurs écrans.
              </p>
            </div>
          </div>

          <Card className="bg-secondary/40 shadow-none" data-testid="student-dashboard-status-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">État du dossier</CardTitle>
              <CardDescription>
                Un résumé rapide avant la soutenance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-background/80 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Statut
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {defense?.status === "scheduled" ? "Planifiée" : "En attente"}
                </p>
              </div>
              {defense?.date && (
                <div className="rounded-lg border bg-background/80 p-4 text-sm text-muted-foreground">
                  {defense.date} · {defense.startTime} - {defense.endTime} ·{" "}
                  {defense.roomName}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          label="Statut soutenance"
          value={stats?.defenseStatus === "scheduled" ? "Planifiée" : "En attente"}
          icon={GraduationCap}
          valueClassName="text-xl font-semibold"
          data-testid="student-dashboard-stats-status"
        />
        <StatsCard label="Membres du groupe" value={stats?.groupMembers} icon={Users} data-testid="student-dashboard-stats-members" />
        <StatsCard label="Documents suivis" value={stats?.documentCount} icon={Download} data-testid="student-dashboard-stats-documents" />
        <StatsCard label="Pièces manquantes" value={stats?.missingDocuments} icon={CalendarDays} data-testid="student-dashboard-stats-missing" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card data-testid="student-dashboard-defense-card">
          <CardHeader>
            <CardTitle>Fiche de soutenance</CardTitle>
            <CardDescription>
              Le sujet, l'encadrement et le planning associés à votre dossier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Projet</p>
              <p className="mt-2 text-xl font-semibold">
                {defense?.projectTitle}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {defense?.projectDescription}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Encadrant</p>
                <p className="mt-2 font-medium">{defense?.supervisorName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Horaire</p>
                 <div className="mt-2 font-medium">
                   {isLoading
                     ? <Skeleton className="h-5 w-48" />
                     : defense?.date
                       ? `${defense.date} · ${defense.startTime} - ${defense.endTime}`
                       : "En attente de planification"}
                 </div>
              </div>
            </div>
            {defense?.status === "scheduled" ? (
              <Button
                variant="outline"
                className="w-fit"
                onClick={() => window.print()}
                data-testid="student-dashboard-print-btn"
              >
                <Printer className="mr-2 size-4" />
                Imprimer la convocation
              </Button>
            ) : (
              <Link
                to="/student/group"
                className={buttonVariants({ variant: "outline" })}
                data-testid="student-dashboard-group-link"
              >
                Créez ou rejoignez un groupe
              </Link>
            )}
          </CardContent>
        </Card>

        <Card data-testid="student-dashboard-jury-card">
          <CardHeader>
            <CardTitle>Composition du jury</CardTitle>
            <CardDescription>
              Les membres actuellement associés à votre soutenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defense?.juryMembers && defense.juryMembers.length > 0 ? (
              defense.juryMembers.map((member) => (
              <div
                key={`${member.roleName}-${member.teacherName}`}
                className="rounded-lg border p-4"
                data-testid={`student-dashboard-jury-member-${member.roleName}-${member.teacherName}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium">{member.teacherName}</p>
                  <Badge variant="outline">{member.roleName}</Badge>
                </div>
              </div>
            ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun membre du jury assigné.
              </div>
            )}
            {defense?.result && (
              <div className="rounded-lg border bg-secondary p-4" data-testid="student-dashboard-result">
                <p className="text-sm text-muted-foreground">Résultat</p>
                <p className="mt-2 font-semibold">{defense.result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

