import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConvocationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	studentData: {
		name: string;
		cne: string;
		filiere: string;
		projectTitle: string;
		date: string;
		time: string;
		room: string;
		jury: { role: string; name: string }[];
	};
}

export default function ConvocationDialog({
	isOpen,
	onClose,
	studentData,
}: ConvocationDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-2xl bg-white text-slate-950 shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
				<div
					id="printable-convocation"
					className="p-12 space-y-8 overflow-y-auto"
				>
					{/* Title */}
					<div className="text-center space-y-4 py-4">
						<h1 className="text-3xl font-heading font-bold uppercase tracking-widest border-y py-2 border-double border-slate-900">
							Convocation de Soutenance
						</h1>
						<p className="text-lg italic font-serif">
							Projet de Fin d'Études (PFE)
						</p>
					</div>

					{/* Body */}
					<div className="space-y-6 font-serif text-lg leading-relaxed">
						<p>
							Il est porté à la connaissance de l'étudiant(e){" "}
							<span className="font-bold underline">{studentData.name}</span>{" "}
							(CNE: {studentData.cne}), inscrit(e) en{" "}
							<span className="font-bold">{studentData.filiere}</span>, que sa
							soutenance est programmée pour :
						</p>

						<div className="bg-slate-50 p-6 rounded border border-slate-200 space-y-3">
							<div className="flex justify-between">
								<span className="text-slate-600">Date :</span>
								<span className="font-bold">{studentData.date}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600">Heure :</span>
								<span className="font-bold">{studentData.time}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600">Lieu :</span>
								<span className="font-bold">{studentData.room}</span>
							</div>
						</div>

						<div className="space-y-2">
							<p className="font-bold">Sujet :</p>
							<p className="italic border-l-4 border-slate-300 pl-4 py-2 bg-slate-50/50">
								"{studentData.projectTitle}"
							</p>
						</div>

						<div className="space-y-4">
							<p className="font-bold">Composition du Jury :</p>
							<table className="w-full text-left border-collapse">
								<tbody>
									{studentData.jury.map((m, i) => (
										<tr
											key={i}
											className="border-b border-slate-100 last:border-0"
										>
											<td className="py-2 text-slate-600 w-1/3">{m.role}</td>
											<td className="py-2 font-bold">{m.name}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="bg-slate-50 p-4 border-t flex justify-end gap-3 no-print">
					<Button variant="ghost" onClick={onClose}>
						Annuler
					</Button>
					<Button className="gap-2" onClick={() => window.print()}>
						<Download className="h-4 w-4" /> Imprimer le PDF
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
		position: static;
		width: 100%;
		margin: 0;
		padding: 0;
	}

	.no-print {
		display: none !important;
	}
}
      `}</style>
		</div>
	);
}
