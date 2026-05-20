import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { bulkCreateUsers, bulkCreateRooms, type RoomImportData } from "@/lib/api";

interface BulkImportDialogProps {
  entity: "student" | "teacher" | "coordinator" | "room";
  triggerButtonText?: string;
  onSuccess?: () => void;
}

const ENTITY_HEADERS: Record<string, string[]> = {
  student: ["prénom", "nom", "email", "cne", "major", "niveau"],
  teacher: ["prénom", "nom", "email", "département", "grade"],
  room: ["nom", "département", "capacité"],
};

export function BulkImportDialog({
  entity,
  triggerButtonText = "Importation en masse",
  onSuccess,
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (selectedFile: File) => {
    const isExcel =
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      selectedFile.type === "application/vnd.ms-excel";

    if (!isExcel) {
      toast.error(
        "Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx ou .xls).",
      );
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws) as Record<string, string | number>[];

      if (rawData.length === 0) {
        toast.error("Le fichier semble être vide.");
        setFile(null);
        return;
      }

      const headers = Object.keys(rawData[0]).map((h) =>
        h.toLowerCase().trim(),
      );
      const expectedHeaders = ENTITY_HEADERS[entity];

      const missingHeaders = expectedHeaders.filter(
        (h) => !headers.some((header) => header.includes(h.toLowerCase())),
      );

      if (missingHeaders.length > 0) {
        toast.error(`Colonnes manquantes : ${missingHeaders.join(", ")}`);
        setFile(null);
        setData([]);
        return;
      }

      const mappedData = rawData.map((item) => {
        const newItem: Record<string, string | number> = {};
        Object.keys(item).forEach((key) => {
          const normalizedKey = key.toLowerCase().trim();
          if (normalizedKey.includes("prénom")) newItem.firstName = item[key];
          else if (normalizedKey.includes("nom")) {
            if (entity === "room") newItem.name = item[key];
            else newItem.lastName = item[key];
          } else if (normalizedKey.includes("email")) newItem.email = item[key];
          else if (normalizedKey.includes("cne")) newItem.cne = item[key];
          else if (normalizedKey.includes("major"))
            newItem.majorName = item[key];
          else if (normalizedKey.includes("niveau"))
            newItem.levelName = item[key];
          else if (normalizedKey.includes("département")) {
            if (entity === "room") newItem.departmentId = item[key];
            else newItem.departmentName = item[key];
          }
          else if (normalizedKey.includes("grade"))
            newItem.gradeName = item[key];
          else if (normalizedKey.includes("capacité"))
            newItem.capacity = item[key];
          else newItem[normalizedKey] = item[key];
        });
        return newItem;
      });

      setData(mappedData);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) parseFile(droppedFile);
  };

  const ENTITY_LABELS: Record<string, string> = {
    student: "Étudiants",
    teacher: "Enseignants",
    coordinator: "Coordinateurs",
    room: "Salles",
  };

  // ... inside BulkImportDialog component

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (entity === "room") {
        await bulkCreateRooms(data as RoomImportData[]);
      } else {
        await bulkCreateUsers(data, entity);
      }
      toast.success(
        `${data.length} ${ENTITY_LABELS[entity].toLowerCase()} importés avec succès.`,
      );
      setIsOpen(false);
      setFile(null);
      setData([]);
      onSuccess?.();
    } catch (error) {
      toastError(error, "Échec de l'importation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline">
          <FileUp className="mr-2 h-4 w-4" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Importation en masse : {entity}</DialogTitle>
          <DialogDescription>
            Téléchargez un fichier Excel pour importer plusieurs {entity}s à la
            fois.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le fichier Excel doit contenir les colonnes suivantes :
            <span className="font-semibold block mt-1">
              {ENTITY_HEADERS[entity]?.join(", ")}
            </span>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted hover:bg-accent"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file
                  ? file.name
                  : "Glissez-déposez ou cliquez pour télécharger le fichier"}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) =>
                e.target.files?.[0] && parseFile(e.target.files[0])
              }
            />
          </div>

          {data.length > 0 && (
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {data.length} enregistrements trouvés.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!file}
          >
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
