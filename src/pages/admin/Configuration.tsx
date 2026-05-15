"use client";

import * as React from "react";
import {
	Plus,
	Pencil,
	Trash2,
	Loader2,
	GraduationCap,
	Layers,
	BookOpen,
	Settings,
} from "lucide-react";

import {
	getFilieres,
	createFiliere,
	updateFiliere,
	deleteFiliere,
	getLevels,
	createLevel,
	updateLevel,
	deleteLevel,
	getGrades,
	createGrade,
	updateGrade,
	deleteGrade,
	getDefenseSettings,
	updateDefenseSettings,
	type DefenseSettings,
} from "@/lib/api";
import { type Filiere, type Level, type Grade } from "@/types";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type ConfigType = "filiere" | "level" | "grade";

export default function Configuration() {
	const [filieres, setFilieres] = React.useState<Filiere[]>([]);
	const [levels, setLevels] = React.useState<Level[]>([]);
	const [grades, setGrades] = React.useState<Grade[]>([]);
	const [settings, setSettings] = React.useState<DefenseSettings>({
		startTime: "08:00",
		endTime: "18:00",
		defenseDuration: 30,
		breakDuration: 15,
	});
	const [isLoading, setIsLoading] = React.useState(true);

	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);

	const [activeType, setActiveType] = React.useState<ConfigType>("filiere");
	const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
	const [formData, setFormData] = React.useState({ name: "" });

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [fRes, lRes, gRes, sRes] = await Promise.all([
				getFilieres(),
				getLevels(),
				getGrades(),
				getDefenseSettings().catch(() => settings),
			]);
			setFilieres(fRes);
			setLevels(lRes);
			setGrades(gRes);
			setSettings(sRes);
		} catch {
			toast.error("Erreur lors du chargement des configurations");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, []);

	const handleOpenDialog = (type: ConfigType, item: any = null) => {
		setActiveType(type);
		setSelectedItem(item);
		setFormData({ name: item?.name || "" });
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			if (selectedItem) {
				if (activeType === "filiere")
					await updateFiliere(selectedItem.id, formData);
				else if (activeType === "level")
					await updateLevel(selectedItem.id, formData);
				else await updateGrade(selectedItem.id, formData);
				toast.success("Modifié avec succès");
			} else {
				if (activeType === "filiere") await createFiliere(formData);
				else if (activeType === "level") await createLevel(formData);
				else await createGrade(formData);
				toast.success("Ajouté avec succès");
			}
			setIsDialogOpen(false);
			fetchData();
		} catch {
			toast.error("Une erreur est survenue");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedItem) return;
		setIsDeleting(true);
		try {
			if (activeType === "filiere") await deleteFiliere(selectedItem.id);
			else if (activeType === "level") await deleteLevel(selectedItem.id);
			else await deleteGrade(selectedItem.id);
			toast.success("Supprimé avec succès");
			fetchData();
		} catch {
			toast.error("Erreur lors de la suppression");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	const handleSettingsUpdate = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await updateDefenseSettings(settings);
			toast.success("Paramètres mis à jour");
		} catch {
			toast.error("Erreur lors de la mise à jour des paramètres");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderConfigCard = (
		title: string,
		description: string,
		items: any[],
		type: ConfigType,
		icon: React.ReactNode,
	) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						{icon} {title}
					</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>
				<Button size="sm" onClick={() => handleOpenDialog(type)}>
					<Plus className="h-4 w-4 mr-2" /> Ajouter
				</Button>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
						>
							<span className="font-medium">{item.name}</span>
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => handleOpenDialog(type, item)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive"
									onClick={() => {
										setActiveType(type);
										setSelectedItem(item);
										setIsDeleteDialogOpen(true);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
					{items.length === 0 && (
						<p className="text-sm text-muted-foreground italic py-2">
							Aucun élément configuré.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
				<p className="text-muted-foreground">
					Gérez les entités fondamentales du système.
				</p>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="grid md:grid-cols-2 gap-6">
					{renderConfigCard(
						"Filières",
						"Liste des filières disponibles.",
						filieres,
						"filiere",
						<BookOpen className="h-5 w-5" />,
					)}
					{renderConfigCard(
						"Niveaux",
						"Cycles universitaires.",
						levels,
						"level",
						<Layers className="h-5 w-5" />,
					)}
					{renderConfigCard(
						"Grades",
						"Titres académiques.",
						grades,
						"grade",
						<GraduationCap className="h-5 w-5" />,
					)}

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" /> Paramètres des Soutenances
							</CardTitle>
							<CardDescription>
								Définissez les créneaux horaires globaux.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSettingsUpdate} className="grid gap-4">
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel>Début de journée</FieldLabel>
										<Input
											type="time"
											value={settings.startTime}
											onChange={(e) =>
												setSettings({ ...settings, startTime: e.target.value })
											}
											required
										/>
									</Field>
									<Field>
										<FieldLabel>Fin de journée</FieldLabel>
										<Input
											type="time"
											value={settings.endTime}
											onChange={(e) =>
												setSettings({ ...settings, endTime: e.target.value })
											}
											required
										/>
									</Field>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel>Durée soutenance (min)</FieldLabel>
										<Input
											type="number"
											value={settings.defenseDuration}
											onChange={(e) =>
												setSettings({
													...settings,
													defenseDuration: parseInt(e.target.value),
												})
											}
											required
										/>
									</Field>
									<Field>
										<FieldLabel>Durée repos (min)</FieldLabel>
										<Input
											type="number"
											value={settings.breakDuration}
											onChange={(e) =>
												setSettings({
													...settings,
													breakDuration: parseInt(e.target.value),
												})
											}
											required
										/>
									</Field>
								</div>
								<Button type="submit" className="mt-2" disabled={isSubmitting}>
									{isSubmitting && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Sauvegarder
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedItem ? "Modifier" : "Ajouter"}{" "}
							{activeType === "filiere"
								? "Filière"
								: activeType === "level"
									? "Niveau"
									: "Grade"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<FieldGroup className="py-4">
							<Field>
								<FieldLabel>Nom / Libellé</FieldLabel>
								<Input
									value={formData.name}
									onChange={(e) => setFormData({ name: e.target.value })}
									required
								/>
							</Field>
						</FieldGroup>
						<DialogFooter>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Enregistrer
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmation</AlertDialogTitle>
						<AlertDialogDescription>
							Supprimer cet élément ? Cela pourrait affecter les utilisateurs
							liés.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-destructive hover:bg-destructive/90"
							disabled={isDeleting}
						>
							{isDeleting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Supprimer"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
