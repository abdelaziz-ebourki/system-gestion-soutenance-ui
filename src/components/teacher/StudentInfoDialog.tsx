import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DefenseSession } from "@/pages/teacher/types";

export const StudentInfoDialog = ({
	isOpen,
	onClose,
	defense,
}: {
	isOpen: boolean;
	onClose: () => void;
	defense: DefenseSession | null;
}) => {
	if (!isOpen || !defense) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-lg bg-card shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
				<div className="p-6 border-b flex justify-between items-center bg-muted/30">
					<h2 className="text-xl font-heading font-bold text-foreground">
						Dossier des Candidats
					</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full hover:bg-muted"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="p-8 space-y-6">
					<div className="space-y-4">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
							Binôme / Groupe d'Étudiants
						</p>
						{defense.students.map((s, idx) => (
							<div
								key={idx}
								className="flex items-center gap-6 p-4 bg-secondary/50 rounded-2xl border border-border"
							>
								<div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shadow-inner">
									{s.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</div>
								<div className="space-y-1">
									<h3 className="text-lg font-heading font-bold text-foreground">
										{s.name}
									</h3>
									<p className="text-primary text-xs font-medium">{s.cne}</p>
									<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
										Master Qualité Logicielle
									</p>
								</div>
							</div>
						))}
					</div>

					<div className="space-y-2 pt-2">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
							Sujet de PFE
						</p>
						<div className="p-5 bg-foreground text-background rounded-2xl border italic text-sm leading-relaxed shadow-xl">
							"{defense.project}"
						</div>
					</div>
					<Button
						className="w-full gap-2 h-12 rounded-xl font-bold"
						variant="outline"
					>
						<FileText className="h-4 w-4" /> Consulter le Rapport Complet
					</Button>
				</div>
			</div>
		</div>
	);
};
