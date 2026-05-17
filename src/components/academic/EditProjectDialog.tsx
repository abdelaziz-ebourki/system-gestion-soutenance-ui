"use client";

import * as React from "react";

import { getStudentsList, getTeachersList, updateProject } from "@/lib/api";
import type { Project, Student, Teacher } from "@/types";
import { toast } from "sonner";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea
} from "@/components/primitive";

interface EditProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	project: Project | null;
}

const getFullName = (user?: Teacher | Student) =>
	user ? `${user.lastName} ${user.firstName}` : "";

export function EditProjectDialog({
	open,
	onOpenChange,
	onSuccess,
	project,
}: EditProjectDialogProps) {
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [supervisorId, setSupervisorId] = React.useState("");
	const [studentIds, setStudentIds] = React.useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [teachers, setTeachers] = React.useState<Teacher[]>([]);
	const [students, setStudents] = React.useState<Student[]>([]);
	const [isLoadingOptions, setIsLoadingOptions] = React.useState(false);

	React.useEffect(() => {
		if (!open || !project) {
			return;
		}

		setTitle(project.title);
		setDescription(project.description || "");
		setSupervisorId(project.supervisorId);
		setStudentIds(project.studentIds);

		const fetchOptions = async () => {
			setIsLoadingOptions(true);
			try {
				const [teachersData, studentsData] = await Promise.all([
					getTeachersList(),
					getStudentsList(),
				]);
				setTeachers(teachersData);
				setStudents(studentsData);
			} catch {
				toast.error("Erreur lors du chargement des utilisateurs");
			} finally {
				setIsLoadingOptions(false);
			}
		};

		fetchOptions();
	}, [open, project]);

	const handleStudentSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedOptions = Array.from(event.target.selectedOptions).map(
			(option) => option.value,
		);
		setStudentIds(selectedOptions);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!project) {
			return;
		}

		if (!title || !supervisorId || studentIds.length === 0) {
			toast.error("Veuillez remplir tous les champs requis.");
			return;
		}

		setIsSubmitting(true);
		try {
			const supervisor = teachers.find((teacher) => teacher.id === supervisorId);
			const selectedStudents = students.filter((student) =>
				studentIds.includes(student.id),
			);

			await updateProject(project.id, {
				title,
				description,
				supervisorId,
				studentIds,
				studentNames: selectedStudents.map(getFullName),
				supervisorName: getFullName(supervisor),
				status: project.status,
			});
			toast.success("Projet mis a jour");
			onSuccess();
			onOpenChange(false);
		} catch {
			toast.error("Erreur lors de la mise a jour du projet");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[640px]">
				<DialogHeader>
					<DialogTitle>Modifier le projet</DialogTitle>
					<DialogDescription>
						Mettez a jour le sujet, l'encadrement et la composition du groupe.
					</DialogDescription>
				</DialogHeader>
				<form id="edit-project-form" className="grid gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2">
						<Label htmlFor="edit-project-title">Titre</Label>
						<Input
							id="edit-project-title"
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="edit-project-description">Description</Label>
						<Textarea
							id="edit-project-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							className="min-h-28"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="edit-project-supervisor">Encadrant</Label>
						<Select
							value={supervisorId}
							onValueChange={(val) => setSupervisorId(val || "")}
							disabled={isLoadingOptions}
						>
							<SelectTrigger id="edit-project-supervisor" fullWidth>
								<SelectValue placeholder="Selectionner un encadrant" />
							</SelectTrigger>
							<SelectContent>
								{teachers.map((teacher) => (
									<SelectItem key={teacher.id} value={teacher.id}>
										{getFullName(teacher)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="edit-project-students">Etudiants</Label>
						<select
							id="edit-project-students"
							multiple
							value={studentIds}
							onChange={handleStudentSelection}
							className="min-h-40 rounded-md border bg-background px-3 py-2 text-sm"
							disabled={isLoadingOptions}
							required
						>
							{students.map((student) => (
								<option key={student.id} value={student.id}>
									{getFullName(student)}
								</option>
							))}
						</select>
					</div>
				</form>
				<DialogFooter>
					<Button
						type="submit"
						form="edit-project-form"
						isLoading={isSubmitting}
						disabled={isLoadingOptions}
					>
						Sauvegarder
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
