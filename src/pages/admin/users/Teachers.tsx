"use client";

import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

import { getTeachers, createUser, updateUser, deleteUser, getGrades, getDepartments } from "@/lib/api";
import { type Teacher, type Grade, type Department } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Teachers() {
	const [data, setData] = React.useState<Teacher[]>([]);
	const [grades, setGrades] = React.useState<Grade[]>([]);
	const [departments, setDepartments] = React.useState<Department[]>([]);
	const [pageCount, setPageCount] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(
		null,
	);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	// Form state
	const [formData, setFormData] = React.useState({
		lastName: "",
		firstName: "",
		email: "",
		gradeId: "",
		departmentId: "",
		password: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [teachersRes, gradesRes, deptRes] = await Promise.all([
				getTeachers(pagination.pageIndex, pagination.pageSize),
				getGrades(),
				getDepartments(),
			]);
			setData(teachersRes.items);
			setPageCount(teachersRes.pageCount);
			setGrades(gradesRes);
			setDepartments(deptRes);
		} catch {
			toast.error("Erreur lors du chargement des données");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchData();
	}, [pagination]);

	const resetForm = () => {
		setFormData({
			lastName: "",
			firstName: "",
			email: "",
			gradeId: grades[0]?.id || "",
			departmentId: departments[0]?.id || "",
			password: "",
		});
		setSelectedTeacher(null);
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		try {
			await createUser({ ...formData, role: "teacher", isActive: true });
			toast.success("Enseignant ajouté avec succès");
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
		if (!selectedTeacher) return;
		setIsSubmitting(true);
		try {
			const updateData = { ...formData, role: "teacher" as const };
			if (!updateData.password) delete (updateData as any).password;

			await updateUser(selectedTeacher.id, updateData);
			toast.success("Profil enseignant mis à jour");
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
		if (selectedTeacher) handleUpdate();
		else handleCreate();
	};

	const handleDelete = async () => {
		if (!selectedTeacher) return;
		setIsDeleting(true);
		try {
			await deleteUser(selectedTeacher.id);
			toast.success("Enseignant supprimé");
			fetchData();
		} catch {
			toast.error("Erreur lors de la suppression");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedTeacher(null);
		}
	};

	const columns: ColumnDef<Teacher>[] = [
		{
			id: "full_name",
			header: "Nom Complet",
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.lastName} {row.original.firstName}
				</div>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "gradeId",
			header: "Grade",
			cell: ({ row }) => {
				const id = row.getValue("gradeId") as string;
				const name = grades.find(g => g.id === id)?.name || id;
				return (
					<Badge variant="outline" className="bg-primary/5">
						{name}
					</Badge>
				);
			},
		},
		{
			accessorKey: "departmentId",
			header: "Département",
			cell: ({ row }) => {
				const id = row.getValue("departmentId") as string;
				return departments.find(d => d.id === id)?.name || id;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const teacher = row.original;
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
										setSelectedTeacher(teacher);
										setFormData({
											lastName: teacher.lastName,
											firstName: teacher.firstName,
											email: teacher.email,
											gradeId: teacher.gradeId,
											departmentId: teacher.departmentId,
											password: "",
										});
										setIsDialogOpen(true);
									}}
								>
									<Pencil className="mr-2 h-4 w-4" /> Modifier
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => {
										setSelectedTeacher(teacher);
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
					<h1 className="text-3xl font-bold tracking-tight">Enseignants</h1>
					<p className="text-muted-foreground">Gestion du corps professoral.</p>
				</div>
				<Button
					onClick={() => {
						resetForm();
						setIsDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4" /> Nouvel Enseignant
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
					manualPagination
					pageCount={pageCount}
					pagination={pagination}
					onPaginationChange={setPagination}
					filterColumn="lastName"
					filterPlaceholder="Rechercher par nom..."
				/>
			)}

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{selectedTeacher ? "Modifier" : "Ajouter"} Enseignant
						</DialogTitle>
						<DialogDescription>
							Informations professionnelles de l'enseignant.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<FieldGroup className="grid grid-cols-2 gap-4 py-4">
							<Field>
								<FieldLabel>Nom</FieldLabel>
								<Input
									value={formData.lastName}
									onChange={(e) =>
										setFormData({ ...formData, lastName: e.target.value })
									}
									required
								/>
							</Field>
							<Field>
								<FieldLabel>Prénom</FieldLabel>
								<Input
									value={formData.firstName}
									onChange={(e) =>
										setFormData({ ...formData, firstName: e.target.value })
									}
									required
								/>
							</Field>
							<Field className="col-span-2">
								<FieldLabel>Email</FieldLabel>
								<Input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									required
								/>
							</Field>
							<Field>
								<FieldLabel>Grade</FieldLabel>
								<Select
									value={formData.gradeId}
									onValueChange={(v) =>
										setFormData({ ...formData, gradeId: v || "" })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir un grade" />
									</SelectTrigger>
									<SelectContent>
										{grades.map((g) => (
											<SelectItem key={g.id} value={g.id}>
												{g.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel>Département</FieldLabel>
								<Select
									value={formData.departmentId}
									onValueChange={(v) =>
										setFormData({ ...formData, departmentId: v || "" })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir un département" />
									</SelectTrigger>
									<SelectContent>
										{departments.map((d) => (
											<SelectItem key={d.id} value={d.id}>
												{d.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field className="col-span-2">
								<FieldLabel>
									Mot de passe{" "}
									{selectedTeacher && "(laisser vide pour ne pas changer)"}
								</FieldLabel>
								<Input
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required={!selectedTeacher}
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
							Supprimer l'enseignant {selectedTeacher?.lastName}{" "}
							{selectedTeacher?.firstName} ?
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
