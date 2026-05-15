"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { createJury, getProjects, getTeachersList } from "@/lib/api";
import type { Project, Teacher } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CreateJuryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

const getFullName = (teacher?: Teacher) =>
	teacher ? `${teacher.lastName} ${teacher.firstName}` : "";

export function CreateJuryDialog({
	open,
	onOpenChange,
	onSuccess,
}: CreateJuryDialogProps) {
	const [projectId, setProjectId] = React.useState("");
	const [presidentId, setPresidentId] = React.useState("");
	const [reporterId, setReporterId] = React.useState("");
	const [examinerId, setExaminerId] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [teachers, setTeachers] = React.useState<Teacher[]>([]);
	const [projects, setProjects] = React.useState<Project[]>([]);
	const [isLoadingOptions, setIsLoadingOptions] = React.useState(false);

	React.useEffect(() => {
		if (!open) {
			return;
		}

		setProjectId("");
		setPresidentId("");
		setReporterId("");
		setExaminerId("");

		const fetchData = async () => {
			setIsLoadingOptions(true);
			try {
				const [teachersData, projectsData] = await Promise.all([
					getTeachersList(),
					getProjects(),
				]);
				setTeachers(teachersData);
				setProjects(projectsData);
			} catch {
				toast.error("Erreur lors du chargement des donnees");
			} finally {
				setIsLoadingOptions(false);
			}
		};

		fetchData();
	}, [open]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!projectId || !presidentId || !reporterId || !examinerId) {
			toast.error("Veuillez remplir tous les champs requis.");
			return;
		}

		if (new Set([presidentId, reporterId, examinerId]).size < 3) {
			toast.error("Chaque role doit etre attribue a un enseignant different.");
			return;
		}

		setIsSubmitting(true);
		try {
			const selectedProject = projects.find((project) => project.id === projectId);
			const president = teachers.find((teacher) => teacher.id === presidentId);
			const reporter = teachers.find((teacher) => teacher.id === reporterId);
			const examiner = teachers.find((teacher) => teacher.id === examinerId);

			await createJury({
				projectId,
				projectTitle: selectedProject?.title || "",
				presidentId,
				presidentName: getFullName(president),
				reporterId,
				reporterName: getFullName(reporter),
				examinerId,
				examinerName: getFullName(examiner),
			});
			toast.success("Jury cree avec succes");
			onSuccess();
			onOpenChange(false);
		} catch {
			toast.error("Erreur lors de la creation du jury");
		} finally {
			setIsSubmitting(false);
		}
	};

	const availableProjects = projects.filter(
		(project) => project.status !== "rejected",
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[620px]">
				<DialogHeader>
					<DialogTitle>Nouveau jury</DialogTitle>
					<DialogDescription>
						Associez un projet a trois enseignants avec des roles distincts.
					</DialogDescription>
				</DialogHeader>
				<form id="create-jury-form" className="grid gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2">
						<Label htmlFor="jury-project">Projet</Label>
						<select
							id="jury-project"
							value={projectId}
							onChange={(event) => setProjectId(event.target.value)}
							className="h-10 rounded-md border bg-background px-3 text-sm"
							disabled={isLoadingOptions}
							required
						>
							<option value="">Selectionner un projet</option>
							{availableProjects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.title}
								</option>
							))}
						</select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="jury-president">President</Label>
						<select
							id="jury-president"
							value={presidentId}
							onChange={(event) => setPresidentId(event.target.value)}
							className="h-10 rounded-md border bg-background px-3 text-sm"
							disabled={isLoadingOptions}
							required
						>
							<option value="">Selectionner un president</option>
							{teachers
								.filter(
									(teacher) =>
										teacher.id !== reporterId && teacher.id !== examinerId,
								)
								.map((teacher) => (
									<option key={teacher.id} value={teacher.id}>
										{getFullName(teacher)}
									</option>
								))}
						</select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="jury-reporter">Rapporteur</Label>
						<select
							id="jury-reporter"
							value={reporterId}
							onChange={(event) => setReporterId(event.target.value)}
							className="h-10 rounded-md border bg-background px-3 text-sm"
							disabled={isLoadingOptions}
							required
						>
							<option value="">Selectionner un rapporteur</option>
							{teachers
								.filter(
									(teacher) =>
										teacher.id !== presidentId && teacher.id !== examinerId,
								)
								.map((teacher) => (
									<option key={teacher.id} value={teacher.id}>
										{getFullName(teacher)}
									</option>
								))}
						</select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="jury-examiner">Examinateur</Label>
						<select
							id="jury-examiner"
							value={examinerId}
							onChange={(event) => setExaminerId(event.target.value)}
							className="h-10 rounded-md border bg-background px-3 text-sm"
							disabled={isLoadingOptions}
							required
						>
							<option value="">Selectionner un examinateur</option>
							{teachers
								.filter(
									(teacher) =>
										teacher.id !== presidentId && teacher.id !== reporterId,
								)
								.map((teacher) => (
									<option key={teacher.id} value={teacher.id}>
										{getFullName(teacher)}
									</option>
								))}
						</select>
					</div>
				</form>
				<DialogFooter>
					<Button
						type="submit"
						form="create-jury-form"
						disabled={isSubmitting || isLoadingOptions}
					>
						{isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
						Creer le jury
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
