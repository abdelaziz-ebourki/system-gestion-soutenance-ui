"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

import {
	getDepartments,
	createDepartment,
	updateDepartment,
	deleteDepartment,
	getTeachersList,
} from "@/lib/api";
import { type Department, type Teacher } from "@/types";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Departments() {
	const [data, setData] = React.useState<Department[]>([]);
	const [teachers, setTeachers] = React.useState<Teacher[]>([]);
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
		headId: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [deptRes, teachersRes] = await Promise.all([
				getDepartments(),
				getTeachersList(),
			]);
			setData(deptRes);
			setTeachers(teachersRes);
		} catch {
			toast.error("Erreur lors du chargement des données");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, []);

	const resetForm = () => {
		setFormData({ name: "", code: "", headId: teachers[0]?.id || "" });
		setSelectedDept(null);
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		try {
			await createDepartment(formData);
			toast.success("Département ajouté avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchData();
		} catch {
			toast.error("Erreur lors de la création");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => {
		if (!selectedDept) return;
		setIsSubmitting(true);
		try {
			await updateDepartment(selectedDept.id, formData);
			toast.success("Département modifié avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchData();
		} catch {
			toast.error("Erreur lors de la modification");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (selectedDept) handleUpdate();
		else handleCreate();
	};

	const handleDelete = async () => {
		if (!selectedDept) return;
		setIsDeleting(true);
		try {
			await deleteDepartment(selectedDept.id);
			toast.success("Département supprimé");
			fetchData();
		} catch {
			toast.error("Erreur lors de la suppression");
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
			accessorKey: "headId",
			header: "Chef de Département",
			cell: ({ row }) => {
				const id = row.getValue("headId") as string;
				const teacher = teachers.find(t => t.id === id);
				return teacher ? `${teacher.lastName} ${teacher.firstName}` : id;
			}
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
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							<DropdownMenuGroup>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => {
										setSelectedDept(department);
										setFormData({
											name: department.name,
											code: department.code,
											headId: department.headId,
										});
										setIsDialogOpen(true);
									}}
								>
									<Pencil className="mr-2 h-4 w-4" /> Modifier
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => {
										setSelectedDept(department);
										setIsDeleteDialogOpen(true);
									}}
								>
									<Trash2 className="mr-2 h-4 w-4" /> Supprimer
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
					<p className="text-muted-foreground">Structure académique.</p>
				</div>
				<Button
					onClick={() => {
						resetForm();
						setIsDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4" /> Nouveau Département
				</Button>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable
					columns={columns}
					data={data}
					filterColumn="name"
					filterPlaceholder="Rechercher par nom..."
				/>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedDept ? "Modifier" : "Ajouter"} Département
						</DialogTitle>
						<DialogDescription>
							Détails de l'unité académique.
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
								<Select
									value={formData.headId}
									onValueChange={(v) =>
										setFormData({ ...formData, headId: v || "" })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir un enseignant" />
									</SelectTrigger>
									<SelectContent>
										{teachers.map((t) => (
											<SelectItem key={t.id} value={t.id}>
												{t.lastName} {t.firstName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
							Supprimer le département {selectedDept?.name} ?
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
