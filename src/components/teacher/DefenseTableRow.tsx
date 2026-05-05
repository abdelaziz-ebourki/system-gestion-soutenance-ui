import { memo } from "react";
import {
	ChevronUp,
	ChevronDown,
	Clock,
	MapPin,
	User,
	ClipboardCheck,
	File,
} from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DefenseSession } from "@/pages/teacher/types";

interface DefenseTableRowProps {
	defense: DefenseSession;
	isExpanded: boolean;
	onToggleExpand: (id: number) => void;
	onAction: (type: "info" | "eval", defense: DefenseSession) => void;
}

export const DefenseTableRow = memo(
	({ defense, isExpanded, onToggleExpand, onAction }: DefenseTableRowProps) => {
		return (
			<TableRow
				className={`transition-all border-border group ${isExpanded ? "bg-primary/3" : "hover:bg-muted/20"}`}
			>
				<TableCell className="p-6 align-top">
					<div className="space-y-3">
						<button
							onClick={() => onToggleExpand(defense.id)}
							className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl hover:border-primary/50 transition-all shadow-sm group/btn"
						>
							<div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold group-hover/btn:scale-110 transition-transform">
								{defense.students.length}
							</div>
							<div className="flex flex-col items-start">
								<span className="font-bold text-foreground text-sm tracking-tight">
									{defense.groupName}
								</span>
								<span className="text-[9px] text-primary uppercase font-bold tracking-tighter flex items-center gap-1.5 opacity-80">
									{isExpanded ? (
										<ChevronUp className="h-3 w-3" />
									) : (
										<ChevronDown className="h-3 w-3" />
									)}
									{isExpanded ? "Fermer" : "Membres"}
								</span>
							</div>
						</button>

						{isExpanded && (
							<div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
								{defense.students.map((s, idx) => (
									<div
										key={idx}
										className="flex items-center gap-3 pl-4 py-2 border-l-2 border-primary/20 bg-muted/10 rounded-r-xl"
									>
										<div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-[10px] font-bold text-primary">
											{s.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</div>
										<div className="flex flex-col">
											<span className="text-xs font-bold text-foreground leading-none mb-1">
												{s.name}
											</span>
											<span className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">
												{s.cne}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</TableCell>
				<TableCell className="p-6 max-w-62 align-top">
					<p className="text-sm italic text-muted-foreground line-clamp-3 leading-relaxed font-serif">
						"{defense.project}"
					</p>
				</TableCell>
				<TableCell className="p-6 align-top">
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-foreground bg-muted/40 px-3 py-1 rounded-lg w-fit">
							{defense.date}
						</span>
						<span className="text-[10px] text-primary flex items-center gap-1.5 uppercase font-bold tracking-wider px-3">
							<Clock className="h-3 w-3" /> {defense.time}
						</span>
					</div>
				</TableCell>
				<TableCell className="p-6 align-top">
					<div className="flex items-center gap-2 text-sm font-medium text-foreground px-3 py-1 rounded-xl border border-border bg-secondary shadow-sm w-fit">
						<MapPin className="h-4 w-4 text-primary" />
						<span>{defense.room}</span>
					</div>
				</TableCell>
				<TableCell className="p-6 align-top">
					<Badge
						variant="outline"
						className={`px-4 rounded-full border-primary/20 text-primary font-bold ${
							defense.role === "Président" ? "bg-primary/5" : "bg-muted"
						}`}
					>
						{defense.role}
					</Badge>
				</TableCell>
				<TableCell className="p-6 text-right align-top">
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 shadow-sm"
							title="Dossier Étudiants"
							onClick={() => onAction("info", defense)}
						>
							<User className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-10 w-10 rounded-xl border-border hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 shadow-sm"
							title="Saisir PV"
							onClick={() => onAction("eval", defense)}
						>
							<ClipboardCheck className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-10 w-10 rounded-xl border-border hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 shadow-sm"
							title="Rapport"
						>
							<File className="h-4 w-4" />
						</Button>
					</div>
				</TableCell>
			</TableRow>
		);
	},
);
