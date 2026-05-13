import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white text-slate-950 shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div
          id="printable-convocation"
          className="p-12 space-y-8 overflow-y-auto"
        >
          {/* Title Section */}
          <div className="text-center space-y-4 py-4 border-b-2 border-slate-900 pb-8">
            <h1 className="text-3xl font-heading font-bold uppercase tracking-widest">
              Convocation de Soutenance
            </h1>
            <p className="text-lg italic font-serif text-slate-600">
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
                {students.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-l-4 border-slate-900 pl-4 py-1 bg-slate-50"
                  >
                    <span className="font-bold underline text-xl">
                      {s.name}
                    </span>
                    <span className="text-slate-600 font-mono text-sm">
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

            <div className="bg-slate-100 p-8 rounded border-2 border-slate-200 grid sm:grid-cols-3 gap-8">
              <div className="text-center space-y-1">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-tighter">
                  Date du passage
                </p>
                <p className="font-bold text-xl">{date}</p>
              </div>
              <div className="text-center space-y-1 border-x border-slate-200">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-tighter">
                  Heure Précise
                </p>
                <p className="font-bold text-xl">{time}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-tighter">
                  Salle Assignée
                </p>
                <p className="font-bold text-xl">{room}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold uppercase text-xs tracking-widest text-slate-500">
                Sujet du Projet :
              </p>
              <p className="italic text-2xl font-heading leading-tight text-slate-800">
                "{projectTitle}"
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <p className="font-bold uppercase text-xs tracking-widest text-slate-500">
                Composition du Jury :
              </p>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {jury.map((m, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 text-slate-600 w-1/3">{m.role}</td>
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

        <div className="bg-slate-900 p-4 border-t flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-white/60 text-xs px-4">
            <Users className="h-4 w-4" />
            <span>{students.length} Étudiant(s) convoqué(s)</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Annuler
            </Button>
            <Button
              className="gap-2 bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" /> Télécharger / Imprimer
            </Button>
          </div>
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
    </div>
  );
}
