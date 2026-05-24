import { FileText, Users, Calendar, ClipboardList, Printer, ScrollText, Award } from "lucide-react";
import { useJuries, useProjects, useCoordinatorDefenseSessions, useProjectGrades } from "@/hooks/use-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Skeleton, EmptyState } from "@/components/ui";
import { toast } from "sonner";

const DOC_TYPES: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  getUrl: (...args: string[]) => string;
  requiresData: (items: readonly unknown[]) => boolean;
}[] = [
  {
    id: "evaluation-sheet",
    title: "Fiches d'évaluation",
    description: "Générer les fiches d'évaluation individuelles par projet avec grille de notation et signatures.",
    icon: ClipboardList,
    color: "bg-blue-500/10 text-blue-600",
    getUrl: (projectId: string) => `/print/evaluation-sheet?projectId=${projectId}`,
    requiresData: (grades) => grades.length > 0,
  },
  {
    id: "proces-verbal",
    title: "Procès-Verbaux (PV)",
    description: "Générer les PV de soutenance avec notes, décisions et signatures du jury.",
    icon: ScrollText,
    color: "bg-purple-500/10 text-purple-600",
    getUrl: (projectId: string) => `/print/proces-verbal?projectId=${projectId}`,
    requiresData: (grades) => grades.length > 0,
  },
  {
    id: "attendance-list",
    title: "Listes de présence",
    description: "Générer les listes d'émargement par date avec créneaux et signatures.",
    icon: Users,
    color: "bg-green-500/10 text-green-600",
    getUrl: (date: string, sessionId?: string) => `/print/attendance-list?date=${date}${sessionId ? `&sessionId=${sessionId}` : ""}`,
    requiresData: () => true,
  },
  {
    id: "jury-convocation",
    title: "Convocations jury",
    description: "Générer les convocations individuelles pour chaque membre du jury.",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-600",
    getUrl: (projectId: string, teacherId: string) => `/print/jury-convocation?projectId=${projectId}&teacherId=${teacherId}`,
    requiresData: (juries) => juries.length > 0,
  },
  {
    id: "schedule",
    title: "Planning des soutenances",
    description: "Générer le planning complet des soutenances par session avec salles et jurys.",
    icon: Calendar,
    color: "bg-rose-500/10 text-rose-600",
    getUrl: (sessionId: string) => `/print/schedule?sessionId=${sessionId}`,
    requiresData: () => true,
  },
  {
    id: "student-convocation",
    title: "Convocations étudiants",
    description: "Générer les convocations individuelles pour chaque étudiant.",
    icon: Printer,
    color: "bg-teal-500/10 text-teal-600",
    getUrl: () => `/print/student-convocation`,
    requiresData: () => true,
  },
  {
    id: "certificate",
    title: "Attestations",
    description: "Générer les attestations de soutenance pour les étudiants admis.",
    icon: Award,
    color: "bg-amber-500/10 text-amber-600",
    getUrl: (projectId: string) => `/print/certificate?projectId=${projectId}`,
    requiresData: (grades) => grades.length > 0,
  },
];

export default function Documents() {
  const projectsQuery = useProjects();
  const juriesQuery = useJuries();
  const sessionsQuery = useCoordinatorDefenseSessions();
  const gradesQuery = useProjectGrades();

  const juries = juriesQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];

  const isLoading = projectsQuery.isLoading || juriesQuery.isLoading || sessionsQuery.isLoading;

  const handleOpen = (doc: (typeof DOC_TYPES)[number], projectId?: string) => {
    let url: string;
    if (doc.id === "attendance-list") {
      const date = prompt("Date (JJ/MM/AAAA) :", new Date().toLocaleDateString("fr-FR"));
      if (!date) return;
      const sessionId = sessions[0]?.id;
      url = doc.getUrl(date, sessionId);
    } else if (doc.id === "schedule") {
      if (sessions.length === 0) { toast.error("Aucune session disponible."); return; }
      url = doc.getUrl(sessions[0].id);
    } else if (doc.id === "student-convocation") {
      url = doc.getUrl();
    } else if (doc.id === "jury-convocation" && projectId) {
      const jury = juries.find((j) => j.projectId === projectId);
      if (!jury) { toast.error("Aucun jury pour ce projet."); return; }
      if (jury.members.length === 0) { toast.error("Aucun membre dans ce jury."); return; }
      if (jury.members.length === 1) {
        url = doc.getUrl(projectId, jury.members[0].teacherId);
      } else {
        // Open all convocations in new tabs
        for (const member of jury.members) {
          window.open(doc.getUrl(projectId, member.teacherId), "_blank");
        }
        return;
      }
    } else if (projectId) {
      url = doc.getUrl(projectId);
    } else {
      return;
    }
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Génération de documents</h1></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Génération de documents</h1>
        <p className="text-muted-foreground">
          Générez les documents PDF pour les soutenances via l'impression navigateur.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((doc) => (
          <Card key={doc.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${doc.color}`}>
                  <doc.icon className="size-5" />
                </div>
              </div>
              <CardTitle className="mt-3 text-base">{doc.title}</CardTitle>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              {doc.id === "evaluation-sheet" || doc.id === "proces-verbal" || doc.id === "certificate" ? (
                <div className="space-y-1">
                  {grades.length === 0 ? (
                    <EmptyState variant="dashed" description="Aucune note disponible" />
                  ) : (
                    grades.map((g) => (
                      <Button
                        key={g.projectId}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => handleOpen(doc, g.projectId)}
                      >
                        {g.projectTitle}
                      </Button>
                    ))
                  )}
                </div>
              ) : doc.id === "jury-convocation" ? (
                <div className="space-y-1">
                  {juries.length === 0 ? (
                    <EmptyState variant="dashed" description="Aucun jury configuré" />
                  ) : (
                    juries.map((j) => (
                      <Button
                        key={j.id}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => handleOpen(doc, j.projectId)}
                      >
                        {j.projectTitle}
                      </Button>
                    ))
                  )}
                </div>
              ) : doc.id === "schedule" ? (
                sessions.length === 0 ? (
                  <EmptyState variant="dashed" description="Aucune session" />
                ) : (
                  <Button className="w-full" onClick={() => handleOpen(doc)}>
                    <Calendar className="mr-2 size-4" />
                    Générer le planning
                  </Button>
                )
              ) : doc.id === "student-convocation" ? (
                <Button className="w-full" variant="secondary" onClick={() => handleOpen(doc)}>
                  <Printer className="mr-2 size-4" />
                  Ma convocation
                </Button>
              ) : doc.id === "attendance-list" ? (
                <Button className="w-full" variant="secondary" onClick={() => handleOpen(doc)}>
                  <Users className="mr-2 size-4" />
                  Choisir une date
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
