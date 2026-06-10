import { useState, useCallback } from "react";
import { FileText, Users, Calendar, ClipboardList, ScrollText, Loader2 } from "lucide-react";
import { useJuries, useProjects, useCoordinatorDefenseSessions, useProjectGrades } from "@/hooks/queries";
import * as api from "@/lib/api";
import {
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
  Skeleton,
  EmptyState,
} from "@/components/ui";

import { toast } from "sonner";

const DOC_TYPES: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: "evaluation-sheet",
    title: "Fiches d'évaluation",
    description: "Générer les fiches d'évaluation individuelles par projet avec grille de notation et signatures.",
    icon: ClipboardList,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "proces-verbal",
    title: "Procès-Verbaux (PV)",
    description: "Générer les PV de soutenance avec notes, décisions et signatures du jury.",
    icon: ScrollText,
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    id: "attendance-list",
    title: "Listes de présence",
    description: "Générer les listes d'émargement par date avec créneaux et signatures.",
    icon: Users,
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "jury-convocation",
    title: "Convocations jury",
    description: "Générer les convocations individuelles pour chaque membre du jury.",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "schedule",
    title: "Planning des soutenances",
    description: "Générer le planning complet des soutenances par session avec salles et jurys.",
    icon: Calendar,
    color: "bg-rose-500/10 text-rose-600",
  },
];

function openPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export default function Documents() {
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split("T")[0]);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const projectsQuery = useProjects();
  const juriesQuery = useJuries();
  const sessionsQuery = useCoordinatorDefenseSessions();
  const gradesQuery = useProjectGrades();

  const juries = juriesQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const grades = gradesQuery.data ?? [];

  const isLoading = projectsQuery.isLoading || juriesQuery.isLoading || sessionsQuery.isLoading;

  const handleOpenDateDialog = () => {
    setDateInput(new Date().toISOString().split("T")[0]);
    setIsDateDialogOpen(true);
  };

  const fetchAndOpenPdf = useCallback(async (fetcher: () => Promise<Blob>, key: string) => {
    setLoadingPdf(key);
    try {
      const blob = await fetcher();
      openPdfBlob(blob);
    } catch {
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setLoadingPdf(null);
    }
  }, []);

  const handleOpen = (doc: (typeof DOC_TYPES)[number], projectId?: number | string) => {
    const pid = projectId != null ? Number(projectId) : undefined;

    if (doc.id === "attendance-list") {
      return;
    }

    if (doc.id === "evaluation-sheet" && pid != null) {
      fetchAndOpenPdf(() => api.getEvaluationSheetPdf(pid), `evaluation-sheet-${pid}`);
    } else if (doc.id === "proces-verbal" && pid != null) {
      fetchAndOpenPdf(() => api.getProcesVerbalPdf(pid), `proces-verbal-${pid}`);
    } else if (doc.id === "jury-convocation" && pid != null) {
      const jury = juries.find((j) => j.projectId === pid);
      if (!jury) { toast.error("Aucun jury pour ce projet."); return; }
      if (jury.members.length === 0) { toast.error("Aucun membre dans ce jury."); return; }
      fetchAndOpenPdf(() => api.getJuryConvocationsPdf(pid), `jury-convocation-${pid}`);
    } else if (doc.id === "schedule") {
      if (sessions.length === 0) { toast.error("Aucune session disponible."); return; }
      fetchAndOpenPdf(() => api.getDefenseScheduleDocPdf(sessions[0].id), `schedule-${sessions[0].id}`);
    }
  };

  const handleAttendanceGenerate = () => {
    if (sessions.length === 0) { toast.error("Aucune session disponible."); return; }
    fetchAndOpenPdf(
      () => api.getAttendanceListPdf(sessions[0].id),
      `attendance-list-${dateInput}`,
    );
    setIsDateDialogOpen(false);
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
    <div className="space-y-6" data-testid="coord-documents-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Génération de documents</h1>
        <p className="text-muted-foreground">
          Générez les documents PDF pour les soutenances.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((doc) => (
          <Card key={doc.id} className="flex flex-col" data-testid={`coord-documents-card-${doc.id}`}>
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
              {doc.id === "evaluation-sheet" || doc.id === "proces-verbal" ? (
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
                        disabled={loadingPdf !== null}
                        onClick={() => handleOpen(doc, g.projectId)}
                      >
                        {loadingPdf === `${doc.id}-${g.projectId}` ? (
                          <Loader2 className="mr-2 size-3 animate-spin" />
                        ) : null}
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
                        disabled={loadingPdf !== null}
                        onClick={() => handleOpen(doc, j.projectId)}
                      >
                        {loadingPdf === `jury-convocation-${j.projectId}` ? (
                          <Loader2 className="mr-2 size-3 animate-spin" />
                        ) : null}
                        {j.projectTitle}
                      </Button>
                    ))
                  )}
                </div>
              ) : doc.id === "schedule" ? (
                sessions.length === 0 ? (
                  <EmptyState variant="dashed" description="Aucune session" />
                ) : (
                  <Button
                    className="w-full"
                    disabled={loadingPdf !== null}
                    onClick={() => handleOpen(doc)}
                  >
                    {loadingPdf?.startsWith("schedule-") ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Calendar className="mr-2 size-4" />
                    )}
                    Générer le planning
                  </Button>
                )
              ) : doc.id === "attendance-list" ? (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={loadingPdf !== null}
                  onClick={handleOpenDateDialog}
                >
                  {loadingPdf?.startsWith("attendance-list-") ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 size-4" />
                  )}
                  Choisir une date
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="coord-documents-date-dialog">
          <DialogHeader>
            <DialogTitle>Choisir une date</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Sélectionnez la date pour laquelle vous souhaitez générer la liste de présence.
          </DialogDescription>
          <Input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} data-testid="coord-documents-date-input" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDateDialogOpen(false)} data-testid="coord-documents-date-cancel">Annuler</Button>
            <Button
              onClick={handleAttendanceGenerate}
              disabled={loadingPdf !== null}
              data-testid="coord-documents-date-generate"
            >
              {loadingPdf?.startsWith("attendance-list-") && <Loader2 className="mr-2 size-4 animate-spin" />}
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
