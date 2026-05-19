import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  Input,
  Label,
} from "@/components/ui";
import { validate, unavailabilitySchema } from "@/lib/validations";

interface UnavailabilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnavailabilityDialog({
  isOpen,
  onClose,
}: UnavailabilityDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(unavailabilitySchema, {
      startDate,
      endDate,
      reason,
    });

    if (errors) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitted(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <div className="p-6 border-b flex items-center gap-2">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h2 className="text-xl font-heading font-bold">
            Déclarer une Indisponibilité
          </h2>
        </div>

        {submitted ? (
          <div className="p-6 space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Indisponibilité enregistrée</AlertTitle>
              <AlertDescription>
                Votre déclaration est prête à être transmise au coordinateur.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-date"
                    className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
                  >
                    Date de début
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start-date"
                      type="date"
                      className="pl-10"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      error={fieldErrors?.startDate}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="end-date"
                    className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
                  >
                    Date de fin
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end-date"
                      type="date"
                      className="pl-10"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      error={fieldErrors?.endDate}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reason"
                  className="text-xs uppercase font-bold tracking-wider text-muted-foreground"
                >
                  Motif / Justification
                </Label>
                <textarea
                  id="reason"
                  className="w-full min-h-25 rounded-3xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Expliquez brièvement la raison de votre indisponibilité..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                {fieldErrors?.reason && (
                  <p className="text-sm font-medium text-destructive">{fieldErrors.reason}</p>
                )}
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Déclaration sensible</AlertTitle>
              <AlertDescription>
                Cette déclaration sera transmise au coordinateur pour ajuster le
                planning des soutenances. Merci de prévenir au moins 48h à
                l'avance.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Confirmer
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
