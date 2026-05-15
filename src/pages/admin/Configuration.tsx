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
} from "@/lib/api";
import { type Filiere, type Level, type Grade } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
			const [fRes, lRes, gRes] = await Promise.all([
				getFilieres(),
				getLevels(),
				getGrades(),
			]);
			setFilieres(fRes);
			setLevels(lRes);
			setGrades(gRes);
		} catch {
			toast.error("Erreur lors du chargement des configurations");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, []);

	const handleOpenDialog = (item: any = null) => {
		setSelectedItem(item);
		setFormData({ name: item?.name || "" });
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			if (selectedItem) {
				if (activeType === "filiere") await updateFiliere(selectedItem.id, formData);
				else if (activeType === "level") await updateLevel(selectedItem.id, formData);
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

	const renderList = (items: any[]) => (
		<div className="grid gap-4 mt-6">
			{items.map((item) => (
				<div
					key={item.id}
					className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
				>
					<span className="font-medium">{item.name}</span>
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => handleOpenDialog(item)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive"
							onClick={() => {
								setSelectedItem(item);
								setIsDeleteDialogOpen(true);
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			))}
			{items.length === 0 && !isLoading && (
				<div className="text-center py-12 border-2 border-dashed rounded-2xl">
					<p className="text-muted-foreground">Aucun élément configuré.</p>
				</div>
			)}
		</div>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
					<p className="text-muted-foreground">
						Gérez les entités fondamentales du système.
					</p>
				</div>
				<Button onClick={() => handleOpenDialog()}>
					<Plus className="h-4 w-4" /> Ajouter
				</Button>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<Tabs defaultValue="filiere" className="w-full">
					<div className="flex items-center justify-between mb-4">
						<TabsList className="bg-muted p-1 rounded-xl">
							<TabsTrigger
								value="filiere"
								onClick={() => setActiveType("filiere")}
								className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
							>
								<BookOpen className="h-4 w-4" /> Filières
							</TabsTrigger>
							<TabsTrigger
								value="level"
								onClick={() => setActiveType("level")}
								className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
							>
								<Layers className="h-4 w-4" /> Niveaux
							</TabsTrigger>
							<TabsTrigger
								value="grade"
								onClick={() => setActiveType("grade")}
								className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
							>
								<GraduationCap className="h-4 w-4" /> Grades
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="filiere">
						<Card>
							<CardHeader>
								<CardTitle>Filières Académiques</CardTitle>
								<CardDescription>
									Liste des filières disponibles pour les étudiants.
								</CardDescription>
							</CardHeader>
							<CardContent>{renderList(filieres)}</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="level">
						<Card>
							<CardHeader>
								<CardTitle>Niveaux d'Étude</CardTitle>
								<CardDescription>
									Cycles universitaires (L1, L2, L3, M1, M2...).
								</CardDescription>
							</CardHeader>
							<CardContent>{renderList(levels)}</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="grade">
						<Card>
							<CardHeader>
								<CardTitle>Grades Enseignants</CardTitle>
								<CardDescription>
									Titres académiques officiels pour le corps professoral.
								</CardDescription>
							</CardHeader>
							<CardContent>{renderList(grades)}</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedItem ? "Modifier" : "Ajouter"} {activeType === "filiere" ? "Filière" : activeType === "level" ? "Niveau" : "Grade"}
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
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
							Supprimer cet élément ? Cela pourrait affecter les utilisateurs liés.
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
							{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
