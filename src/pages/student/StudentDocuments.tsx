import { useState, useMemo } from "react";
import {
  CalendarClock,
  FileCheck2,
  FileText,
  FolderArchive,
  Upload,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { useStudentDocuments, useUploadStudentDocument } from "@/hooks/use-queries";
import type { StudentDocument } from "@/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { GRACE_PERIOD_DAYS, MS_PER_DAY } from "@/lib/constants";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
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
  rejected: "Refusé",
};

const statusClass: Record<StudentDocument["status"], string> = {
  submitted: "bg-secondary text-secondary-foreground",
  validated: "bg-primary text-primary-foreground",
  missing: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive line-through",
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "Non déposé";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
};

export default function StudentDocuments() {
  const { data: documents = [], isLoading } = useStudentDocuments();
  const uploadMutation = useUploadStudentDocument();
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const validatedCount = useMemo(
    () => documents.filter((document) => document.status === "validated").length,
    [documents],
  );
  const missingCount = useMemo(
    () => documents.filter((document) => document.status === "missing").length,
    [documents],
  );

  const handleUpload = async (document: StudentDocument) => {
    const file = files[document.id];
    if (!file) {
      toast.error("Veuillez sélectionner un fichier.");
      return;
    }

    const now = new Date();
    const deadline = new Date(document.deadline);
    const graceDeadline = new Date(deadline);
    graceDeadline.setDate(graceDeadline.getDate() + GRACE_PERIOD_DAYS);

    if (now > graceDeadline) {
      toast.error(`Date limite dépassée depuis ${Math.ceil((now.getTime() - deadline.getTime()) / MS_PER_DAY)} jours. Dépôt bloqué.`);
      return;
    }

    if (now > deadline) {
      toast.warning(`Date limite dépassée. Dépôt en période de grâce (${GRACE_PERIOD_DAYS} jours).`);
    }

    setUploadingId(document.id);
    try {
      await uploadMutation.mutateAsync({ documentId: document.id, file });
      toast.success("Document envoyé avec succès");
      setFiles((prev) => ({ ...prev, [document.id]: null }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Erreur lors de l'envoi du document"));
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="student-documents-header">Documents</h1>
        <p className="text-muted-foreground" data-testid="student-documents-description">
          Suivez les dépôts attendus, les échéances et l'état de validation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Documents attendus" value={documents.length} icon={FileText} data-testid="student-documents-stats-total" />
        <StatsCard label="Validés" value={validatedCount} icon={FileCheck2} data-testid="student-documents-stats-validated" />
        <StatsCard label="Échéances ouvertes" value={missingCount} icon={CalendarClock} data-testid="student-documents-stats-missing" />
      </div>

      <Card data-testid="student-documents-list-card">
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
                 <div key={document.id} className="rounded-lg border p-4" data-testid={`student-documents-item-${document.id}`}>
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
                       <span suppressHydrationWarning>Échéance: {formatDate(document.deadline)}</span>
                       <span suppressHydrationWarning>Dépôt: {formatDate(document.submittedAt)}</span>
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
                           <Input
                             id={`file-${document.id}`}
                             type="file"
                             onChange={(e) => {
                               const f = e.target.files?.[0] ?? null;
                               setFiles((prev) => ({ ...prev, [document.id]: f }));
                             }}
                             data-testid={`student-documents-file-input-${document.id}`}
                           />
                           {files[document.id] && (
                             <p className="text-xs text-muted-foreground mt-1 truncate max-w-full">
                               {files[document.id]!.name}
                             </p>
                           )}
                         </div>
                         <Button
                           onClick={() => handleUpload(document)}
                           isLoading={uploadingId === document.id}
                           loadingText="Envoi..."
                           data-testid={`student-documents-upload-btn-${document.id}`}
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
               <EmptyState variant="dashed" description="Aucun document trouvé." />
             ))}
        </CardContent>
      </Card>
    </div>
  );
}
