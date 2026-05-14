"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

import {
	getDepartments,
	createDepartment,
	updateDepartment,
	deleteDepartment,
} from "@/lib/api";
import type { Department } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

export default function Departments() {
	const [data, setData] = React.useState<Department[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [selectedDept, setSelectedDept] = React.useState<Department | null>(
		null,
	);

	// Form state
	const [formData, setFormData] = React.useState({
		name: "",
		code: "",
		head: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchDepartments = async () => {
		setIsLoading(true);
		try {
			const result = await getDepartments();
			setData(result);
		} catch {
			toast.error("Erreur lors du chargement des départements");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchDepartments();
	}, []);

	const resetForm = () => {
		setFormData({ name: "", code: "", head: "" });
		setSelectedDept(null);
	};

	const handleCreateDepartment = async () => {
		setIsSubmitting(true);
		try {
			await createDepartment(formData);
			toast.success("Département ajouté avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchDepartments();
		} catch {
			toast.error("Erreur lors de la création du département");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateDepartment = async () => {
		if (!selectedDept) return;
		setIsSubmitting(true);
		try {
			await updateDepartment(selectedDept.id, formData);
			toast.success("Département modifié avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchDepartments();
		} catch {
			toast.error("Erreur lors de la modification du département");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (selectedDept) {
			handleUpdateDepartment();
		} else {
			handleCreateDepartment();
		}
	};

	const handleDelete = async () => {
		if (!selectedDept) return;
		setIsDeleting(true);
		try {
			await deleteDepartment(selectedDept.id);
			toast.success("Département supprimé");
			fetchDepartments();
		} catch {
			toast.error("Erreur lors de la suppression du département");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedDept(null);
		}
	};

	const columns: ColumnDef<Department>[] = [
		{
			accessorKey: "code",
			header: "Code",
			cell: ({ row }) => (
				<div className="font-mono font-bold">{row.getValue("code")}</div>
			),
		},
		{
			accessorKey: "name",
			header: "Nom du Département",
		},
		{
			accessorKey: "head",
			header: "Chef de Département",
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const department = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Ouvrir le menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => navigator.clipboard.writeText(department.id)}
								>
									Copier l'ID
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setSelectedDept(department);
										setFormData({
											name: department.name,
											code: department.code,
											head: department.head,
										});
										setIsDialogOpen(true);
									}}
								>
									<Pencil className="mr-2 h-4 w-4" />
									Modifier
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => {
										setSelectedDept(department);
										setIsDeleteDialogOpen(true);
									}}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Supprimer
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Départements</h1>
					<p className="text-muted-foreground">
						Gérez la structure académique de votre établissement.
					</p>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						if (!open) {
							resetForm();
						}
					}}
				>
					<DialogTrigger
						render={
							<Button>
								<Plus className="h-4 w-4" />
								Nouveau Département
							</Button>
						}
					/>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{selectedDept
									? "Modifier le département"
									: "Ajouter un Département"}
							</DialogTitle>
							<DialogDescription>
								{selectedDept
									? "Mettez à jour les informations du département."
									: "Créez un nouveau département pour organiser vos filières et utilisateurs."}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<FieldGroup className="py-4">
								<Field>
									<FieldLabel>Nom du Département</FieldLabel>
									<Input
										placeholder="ex: Informatique"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</Field>
								<Field>
									<FieldLabel>Code</FieldLabel>
									<Input
										placeholder="ex: INFO"
										value={formData.code}
										onChange={(e) =>
											setFormData({ ...formData, code: e.target.value })
										}
										required
									/>
								</Field>
								<Field>
									<FieldLabel>Chef de Département</FieldLabel>
									<Input
										placeholder="Nom du responsable"
										value={formData.head}
										onChange={(e) =>
											setFormData({ ...formData, head: e.target.value })
										}
										required
									/>
								</Field>
							</FieldGroup>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Annuler
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Enregistrement...
										</>
									) : (
										"Enregistrer"
									)}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. Le département "
							{selectedDept?.name}" sera définitivement supprimé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
							Annuler
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							disabled={isDeleting}
							className="bg-destructive hover:bg-destructive/90"
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Suppression...
								</>
							) : (
								"Supprimer"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable
					columns={columns}
					data={data}
					filterColumn="name"
					filterPlaceholder="Rechercher un département..."
				/>
			)}
		</div>
	);
}
