import { useState, useCallback, memo } from "react";
import { X, ClipboardCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DefenseSession, Candidate } from "@/pages/teacher/types";

const StudentEvaluationRow = memo(
	({
		student,
		index,
		onChange,
	}: {
		student: Candidate;
		index: number;
		onChange: (cne: string, data: { note: string; obs: string }) => void;
	}) => {
		const [note, setNote] = useState("");
		const [obs, setObs] = useState("");

		const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value;
			setNote(val);
			onChange(student.cne, { note: val, obs });
		};

		const handleObsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const val = e.target.value;
			setObs(val);
			onChange(student.cne, { note, obs: val });
		};

		return (
			<div className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
				<div className="flex justify-between items-center border-b border-border pb-4">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
							{index + 1}
						</div>
						<span className="font-bold text-foreground">{student.name}</span>
					</div>
					<Badge variant="secondary" className="font-mono text-[10px]">
						{student.cne}
					</Badge>
				</div>
				<div className="grid sm:grid-cols-4 gap-6">
					<div className="sm:col-span-1 space-y-2">
						<Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
							Note / 20
						</Label>
						<Input
							type="number"
							placeholder="00"
							value={note}
							className="text-lg font-bold h-12 bg-muted/20"
							onChange={handleNoteChange}
						/>
					</div>
					<div className="sm:col-span-3 space-y-2">
						<Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
							Appréciations
						</Label>
						<Input
							placeholder="Remarques pour cet étudiant..."
							value={obs}
							className="h-12 bg-muted/20"
							onChange={handleObsChange}
						/>
					</div>
				</div>
			</div>
		);
	},
);

export const EvaluationDialog = ({
	isOpen,
	onClose,
	defense,
}: {
	isOpen: boolean;
	onClose: () => void;
	defense: DefenseSession | null;
}) => {
	const [evaluations, setEvaluations] = useState<
		Record<string, { note: string; obs: string }>
	>({});

	const handleRowChange = useCallback(
		(cne: string, data: { note: string; obs: string }) => {
			setEvaluations((prev) => ({
				...prev,
				[cne]: data,
			}));
		},
		[],
	);

	if (!isOpen || !defense) return null;

	const handleSave = () => {
		console.log("Saving evaluations:", evaluations);
		alert("PV de soutenance enregistré avec succès.");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-2xl bg-card shadow-2xl rounded-4xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
				<div className="p-6 border-b flex justify-between items-center bg-primary/5">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg text-primary">
							<ClipboardCheck className="h-5 w-5" />
						</div>
						<h2 className="text-xl font-heading font-bold text-foreground">
							Saisie des Notes (PV de Groupe)
						</h2>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="rounded-full"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
					<div className="p-5 bg-muted/30 rounded-2xl mb-4 border-l-4 border-primary">
						<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
							Projet de Soutenance
						</p>
						<p className="font-heading font-bold italic text-foreground/80 leading-snug">
							"{defense.project}"
						</p>
					</div>

					{defense.students.map((s, idx) => (
						<StudentEvaluationRow
							key={s.cne}
							student={s}
							index={idx}
							onChange={handleRowChange}
						/>
					))}

					<div className="flex gap-4 pt-4">
						<Button
							variant="ghost"
							onClick={onClose}
							className="flex-1 rounded-xl h-12"
						>
							Annuler
						</Button>
						<Button
							onClick={handleSave}
							className="flex-1 rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<Save className="h-4 w-4" /> Enregistrer le PV
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
