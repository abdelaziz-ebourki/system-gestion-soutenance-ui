import { useState, useMemo } from "react";
import {
  CalendarClock,
  FileCheck2,
  FileText,
  FolderArchive,
  Upload,
} from "lucide-react";

import { useStudentDocuments } from "@/hooks/use-queries";
import type { StudentDocument } from "@/types";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  StatsCard,
} from "@/components/ui";

const documentIcons: Record<string, typeof FileText> = {
  Rapport: FileText,
  Presentation: FileCheck2,
  Archive: FolderArchive,
};

const statusLabel: Record<StudentDocument["status"], string> = {
  submitted: "Déposé",
  validated: "Validé",
  missing: "Manquant",
};

const statusClass: Record<StudentDocument["status"], string> = {
  submitted: "bg-secondary text-secondary-foreground",
  validated: "bg-primary text-primary-foreground",
  missing: "bg-destructive/10 text-destructive",
};

export default function StudentDocuments() {
  const { data: documents = [], isLoading } = useStudentDocuments();
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const validatedCount = useMemo(
    () => documents.filter((document) => document.status === "validated").length,
    [documents],
  );
  const missingCount = useMemo(
    () => documents.filter((document) => document.status === "missing").length,
    [documents],
  );

  const handleUpload = async (document: StudentDocument) => {
    const now = new Date();
    const deadline = new Date(document.deadline);
    const GRACE_PERIOD_DAYS = 2;
    const graceDeadline = new Date(deadline);
    graceDeadline.setDate(graceDeadline.getDate() + GRACE_PERIOD_DAYS);

    if (now > graceDeadline) {
      toast.error(`Date limite dépassée depuis ${Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))} jours. Dépôt bloqué.`);
      return;
    }

    if (now > deadline) {
      toast.warning(`Date limite dépassée. Dépôt en période de grâce (${GRACE_PERIOD_DAYS} jours).`);
    }

    setIsUploading((prev) => ({ ...prev, [document.id]: true }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Document envoyé avec succès");
    } catch {
      toast.error("Erreur lors de l'envoi du document");
    } finally {
      setIsUploading((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Suivez les dépôts attendus, les échéances et l'état de validation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Documents attendus" value={documents.length} icon={FileText} />
        <StatsCard label="Validés" value={validatedCount} icon={FileCheck2} />
        <StatsCard label="Échéances ouvertes" value={missingCount} icon={CalendarClock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suivi des pièces</CardTitle>
          <CardDescription>
            Vue consolidée des livrables attendus pour votre soutenance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            documents.length > 0 ? (
              documents.map((document) => {
              const Icon = documentIcons[document.type] || FileText;

              return (
                <div key={document.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-secondary p-3 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Type: {document.type}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusClass[document.status]}>
                      {statusLabel[document.status]}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                      <span>Échéance: {document.deadline}</span>
                      <span>Dépôt: {document.submittedAt || "Non déposé"}</span>
                    </div>
                    {document.status === "missing" && (
                      <div className="flex items-end gap-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label
                            htmlFor={`file-${document.id}`}
                            className="sr-only"
                          >
                            Fichier
                          </Label>
                          <Input id={`file-${document.id}`} type="file" />
                        </div>
                        <Button
                          onClick={() => handleUpload(document)}
                          isLoading={isUploading[document.id]}
                          loadingText="Envoi..."
                        >
                          <Upload className="mr-2 size-4" />
                          Déposer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun document trouvé.
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
