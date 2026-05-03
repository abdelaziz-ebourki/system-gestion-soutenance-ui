import { FileText, ExternalLink } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SupervisedProject } from "@/pages/teacher/types";

export const SupervisedProjectCard = ({
	project,
}: {
	project: SupervisedProject;
}) => (
	<Card className="flex flex-col h-full group hover:shadow-xl transition-all border border-border relative overflow-hidden bg-card">
		<div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
		<CardHeader className="pb-4">
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-4">
					<div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5">
						{project.initials}
					</div>
					<div>
						<CardTitle className="text-lg font-heading font-bold text-foreground">
							{project.studentName}
						</CardTitle>
						<CardDescription className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
							{project.filiere}
						</CardDescription>
					</div>
				</div>
				<Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-3 text-[10px] font-bold">
					En cours
				</Badge>
			</div>
		</CardHeader>
		<CardContent className="flex flex-col flex-1 space-y-6">
			<div className="p-4 bg-muted/30 rounded-2xl text-xs italic border border-border/50 group-hover:bg-background transition-colors leading-relaxed">
				"{project.projectTitle}"
			</div>
			<div className="space-y-3">
				<div className="flex justify-between items-center text-xs">
					<span className="text-muted-foreground font-medium">Progression</span>
					<span className="font-bold text-primary">{project.progress}%</span>
				</div>
				<Progress value={project.progress} className="h-2" />
			</div>
			<div className="grid grid-cols-2 gap-3 mt-auto">
				<Button
					size="sm"
					className="gap-2 bg-foreground text-background hover:bg-foreground/90 rounded-xl h-10 font-bold"
				>
					<FileText className="h-4 w-4" /> Rapport
				</Button>
				<Button
					size="sm"
					variant="outline"
					className="gap-2 border-border hover:bg-muted rounded-xl h-10 font-bold"
				>
					<ExternalLink className="h-4 w-4" /> Dossier
				</Button>
			</div>
		</CardContent>
	</Card>
);
