import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would send data to an API
		console.log("Indisponibilité déclarée:", { startDate, endDate, reason });
		alert("Votre indisponibilité a été enregistrée avec succès.");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
			<div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
				<div className="p-6 border-b flex justify-between items-center">
					<div className="flex items-center gap-2">
						<div className="p-2 bg-amber-50 rounded-lg">
							<AlertTriangle className="h-5 w-5 text-amber-600" />
						</div>
						<h2 className="text-xl font-heading font-bold">Déclarer une Indisponibilité</h2>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
						<X className="h-4 w-4" />
					</Button>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start-date" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Date de début</Label>
								<div className="relative">
									<CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="start-date"
										type="date"
										className="pl-10"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value)}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-date" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Date de fin</Label>
								<div className="relative">
									<CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="end-date"
										type="date"
										className="pl-10"
										value={endDate}
										onChange={(e) => setEndDate(e.target.value)}
										required
									/>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="reason" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Motif / Justification</Label>
							<textarea
								id="reason"
								className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Expliquez brièvement la raison de votre indisponibilité..."
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="bg-amber-50 p-4 rounded-xl flex gap-3 items-start">
						<AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
						<p className="text-xs text-amber-800 leading-relaxed">
							Cette déclaration sera transmise au coordinateur pour ajuster le planning des soutenances. Merci de prévenir au moins 48h à l'avance.
						</p>
					</div>

					<div className="flex gap-3 pt-2">
						<Button type="button" variant="outline" onClick={onClose} className="flex-1">
							Annuler
						</Button>
						<Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800">
							Confirmer
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
