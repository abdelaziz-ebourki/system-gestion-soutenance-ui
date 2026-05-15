import * as React from "react";
import { FileCheck2, Loader2, MessageSquareText, PencilLine } from "lucide-react";

import {
	getTeacherEvaluations,
	submitTeacherEvaluation,
} from "@/lib/api";
import type { TeacherEvaluation } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const roleLabel: Record<TeacherEvaluation["role"], string> = {
	president: "President",
	reporter: "Rapporteur",
	examiner: "Examinateur",
	supervisor: "Encadrant",
};

export default function TeacherEvaluations() {
	const [evaluations, setEvaluations] = React.useState<TeacherEvaluation[]>([]);
	const [selectedEvaluation, setSelectedEvaluation] =
		React.useState<TeacherEvaluation | null>(null);
	const [score, setScore] = React.useState("");
	const [comment, setComment] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(true);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const loadEvaluations = async () => {
		setIsLoading(true);
		try {
			setEvaluations(await getTeacherEvaluations());
		} catch {
			toast.error("Erreur lors du chargement des evaluations");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		loadEvaluations();
	}, []);

	const openEvaluation = (evaluation: TeacherEvaluation) => {
		setSelectedEvaluation(evaluation);
		setScore(evaluation.score?.toString() || "");
		setComment(evaluation.comment || "");
	};

	const closeEvaluation = () => {
		setSelectedEvaluation(null);
		setScore("");
		setComment("");
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!selectedEvaluation) {
			return;
		}

		setIsSubmitting(true);
		try {
			await submitTeacherEvaluation(selectedEvaluation.id, {
				score: Number(score),
				comment,
			});
			toast.success("Evaluation enregistree");
			closeEvaluation();
			await loadEvaluations();
		} catch {
			toast.error("Erreur lors de l'enregistrement");
		} finally {
			setIsSubmitting(false);
		}
	};

	const pendingEvaluations = evaluations.filter(
		(evaluation) => evaluation.status === "pending",
	);
	const submittedEvaluations = evaluations.filter(
		(evaluation) => evaluation.status === "submitted",
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Evaluations</h1>
				<p className="text-muted-foreground">
					Gerez les notes et les appreciations des soutenances.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">A completer</p>
							<p className="mt-2 text-3xl font-semibold">{pendingEvaluations.length}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<PencilLine className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Soumises</p>
							<p className="mt-2 text-3xl font-semibold">{submittedEvaluations.length}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<FileCheck2 className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Commentaires</p>
							<p className="mt-2 text-3xl font-semibold">
								{evaluations.filter((evaluation) => evaluation.comment).length}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<MessageSquareText className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Evaluations en attente</CardTitle>
						<CardDescription>
							Saisissez une note et une appreciation pour chaque dossier.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoading ? (
							<div className="py-10 text-center text-sm text-muted-foreground">
								Chargement des evaluations...
							</div>
						) : (
							pendingEvaluations.map((evaluation) => (
								<div key={evaluation.id} className="rounded-2xl border p-4">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p className="font-medium">{evaluation.projectTitle}</p>
											<p className="mt-1 text-sm text-muted-foreground">
												{evaluation.studentNames.join(", ")}
											</p>
										</div>
										<Badge variant="outline">{roleLabel[evaluation.role]}</Badge>
									</div>
									<div className="mt-4">
										<Button onClick={() => openEvaluation(evaluation)}>
											Saisir l'evaluation
										</Button>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Historique recent</CardTitle>
						<CardDescription>
							Les evaluations deja transmises au systeme.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{submittedEvaluations.map((evaluation) => (
							<div key={evaluation.id} className="rounded-2xl border p-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-medium">{evaluation.projectTitle}</p>
										<p className="mt-1 text-sm text-muted-foreground">
											Note: {evaluation.score}/20
										</p>
									</div>
									<Badge className="bg-secondary text-secondary-foreground">
										{roleLabel[evaluation.role]}
									</Badge>
								</div>
								{evaluation.comment && (
									<p className="mt-3 text-sm text-muted-foreground">
										{evaluation.comment}
									</p>
								)}
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Dialog
				open={Boolean(selectedEvaluation)}
				onOpenChange={(open) => {
					if (!open) {
						closeEvaluation();
					}
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Completer une evaluation</DialogTitle>
						<DialogDescription>
							Enregistrez votre note et votre appreciation pour ce dossier.
						</DialogDescription>
					</DialogHeader>
					<form id="teacher-evaluation-form" className="grid gap-4" onSubmit={handleSubmit}>
						<div className="rounded-2xl border bg-secondary/40 p-4">
							<p className="font-medium">{selectedEvaluation?.projectTitle}</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{selectedEvaluation?.studentNames.join(", ")}
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="teacher-score">Note / 20</Label>
							<Input
								id="teacher-score"
								type="number"
								min="0"
								max="20"
								step="0.5"
								value={score}
								onChange={(event) => setScore(event.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="teacher-comment">Appreciation</Label>
							<Textarea
								id="teacher-comment"
								value={comment}
								onChange={(event) => setComment(event.target.value)}
								className="min-h-28"
								required
							/>
						</div>
					</form>
					<DialogFooter>
						<Button
							type="submit"
							form="teacher-evaluation-form"
							disabled={isSubmitting}
						>
							{isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
							Enregistrer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
