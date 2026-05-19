import { Download, Users } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
} from "@/components/ui";

interface Student {
  name: string;
  cne: string;
}

interface ConvocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  filiere: string;
  projectTitle: string;
  date: string;
  time: string;
  room: string;
  jury: { role: string; name: string }[];
}

export default function ConvocationDialog({
  isOpen,
  onClose,
  students,
  filiere,
  projectTitle,
  date,
  time,
  room,
  jury,
}: ConvocationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div
          id="printable-convocation"
          className="p-12 space-y-8 overflow-y-auto"
        >
          {/* Title Section */}
          <div className="text-center space-y-4 py-4 border-b-2 border-slate-900 pb-8">
            <h1 className="text-3xl font-heading font-bold uppercase tracking-widest">
              Convocation de Soutenance
            </h1>
            <p className="text-lg italic font-serif text-muted-foreground">
              Session de Printemps 2026 — Projet de Fin d'Études
            </p>
          </div>

          {/* Body */}
          <div className="space-y-6 font-serif text-lg leading-relaxed">
            <div>
              <p className="mb-4">
                Il est porté à la connaissance des candidat(s) suivant(s) :
              </p>
              <div className="grid gap-4">
                {students.map((s) => (
                  <div
                    key={s.cne}
                    className="flex justify-between items-center border-l-4 border-slate-900 pl-4 py-1 bg-muted"
                  >
                    <span className="font-bold underline text-xl">
                      {s.name}
                    </span>
                    <span className="text-muted-foreground font-mono text-sm">
                      CNE: {s.cne}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Inscrit(s) en <span className="font-bold">{filiere}</span>, que
                leur soutenance est programmée pour :
              </p>
            </div>

            <div className="bg-muted p-8 rounded border grid sm:grid-cols-3 gap-8">
              <div className="text-center space-y-1">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">
                  Date du passage
                </p>
                <p className="font-bold text-xl">{date}</p>
              </div>
              <div className="text-center space-y-1 border-x border-border">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">
                  Heure Précise
                </p>
                <p className="font-bold text-xl">{time}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">
                  Salle Assignée
                </p>
                <p className="font-bold text-xl">{room}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold uppercase text-xs tracking-widest text-muted-foreground">
                Sujet du Projet :
              </p>
              <p className="italic text-2xl font-heading leading-tight text-foreground">
                "{projectTitle}"
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <p className="font-bold uppercase text-xs tracking-widest text-muted-foreground">
                Composition du Jury :
              </p>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {jury.map((m) => (
                    <tr
                      key={m.role + m.name}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 text-muted-foreground w-1/3">{m.role}</td>
                      <td className="py-3 font-bold">{m.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-12 text-right">
            <p className="text-sm font-bold uppercase tracking-widest border-t-2 border-slate-900 inline-block pt-2">
              Le Coordinateur de Filière
            </p>
          </div>
        </div>

        <div className="bg-foreground p-4 border-t flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-background/60 text-xs px-4">
            <Users className="h-4 w-4" />
            <span>{students.length} Étudiant(s) convoqué(s)</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-background hover:bg-foreground/10 hover:text-background"
            >
              Annuler
            </Button>
            <Button
              className="gap-2 bg-background text-foreground hover:bg-background/90"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" /> Télécharger / Imprimer
            </Button>
          </div>
        </div>

        <style>{`
@media print {
  @page {
    size: A4;
    margin: 0cm;
  }

  body * {
    visibility: hidden;
  }

  #printable-convocation,
  #printable-convocation * {
    visibility: visible;
  }

  #printable-convocation {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 2cm;
    background: white;
  }

  .no-print {
    display: none !important;
  }
}
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
