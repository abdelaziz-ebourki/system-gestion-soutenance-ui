"use client";

import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

import {
	getStudents,
	createUser,
	updateUser,
	deleteUser,
	getFilieres,
	getLevels,
} from "@/lib/api";
import { type Student, type Filiere, type Level } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
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

export default function Students() {
	const [data, setData] = React.useState<Student[]>([]);
	const [filieres, setFilieres] = React.useState<Filiere[]>([]);
	const [levels, setLevels] = React.useState<Level[]>([]);
	const [pageCount, setPageCount] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(
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
		cne: "",
		filiereId: "",
		levelId: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const [studentsRes, filieresRes, levelsRes] = await Promise.all([
				getStudents(pagination.pageIndex, pagination.pageSize),
				getFilieres(),
				getLevels(),
			]);
			setData(studentsRes.items);
			setPageCount(studentsRes.pageCount);
			setFilieres(filieresRes);
			setLevels(levelsRes);
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
			cne: "",
			filiereId: filieres[0]?.id || "",
			levelId: levels[0]?.id || "",
		});
		setSelectedStudent(null);
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		try {
			await createUser({ ...formData, role: "student", isActive: false });
			toast.success("Étudiant créé avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchData();
		} catch {
			toast.error("Erreur lors de la création de l'étudiant");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => {
		if (!selectedStudent) return;
		setIsSubmitting(true);
		try {
			await updateUser(selectedStudent.id, { ...formData, role: "student" as const });
			toast.success("Étudiant modifié avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchData();
		} catch {
			toast.error("Erreur lors de la modification de l'étudiant");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (selectedStudent) handleUpdate();
		else handleCreate();
	};

	const handleDelete = async () => {
		if (!selectedStudent) return;
		setIsDeleting(true);
		try {
			await deleteUser(selectedStudent.id);
			toast.success("Étudiant supprimé");
			fetchData();
		} catch {
			toast.error("Erreur lors de la suppression");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedStudent(null);
		}
	};

	const columns: ColumnDef<Student>[] = [
		{
			accessorKey: "cne",
			header: "CNE",
			cell: ({ row }) => (
				<code className="font-bold">{row.getValue("cne")}</code>
			),
		},
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
			accessorKey: "filiereId",
			header: "Filière",
			cell: ({ row }) => {
				const id = row.getValue("filiereId") as string;
				return filieres.find((f) => f.id === id)?.name || id;
			},
		},
		{
			accessorKey: "levelId",
			header: "Niveau",
			cell: ({ row }) => {
				const id = row.getValue("levelId") as string;
				const name = levels.find((l) => l.id === id)?.name || id;
				return <Badge variant="secondary">{name}</Badge>;
			},
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const student = row.original;
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
										setSelectedStudent(student);
										setFormData({
											lastName: student.lastName,
											firstName: student.firstName,
											email: student.email,
											cne: student.cne,
											filiereId: student.filiereId,
											levelId: student.levelId,
										});
										setIsDialogOpen(true);
									}}
								>
									<Pencil className="mr-2 h-4 w-4" /> Modifier
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => {
										setSelectedStudent(student);
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
					<h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
					<p className="text-muted-foreground">
						Gestion des inscriptions et profils étudiants.
					</p>
				</div>
				<div className="flex gap-2">
					<BulkImportDialog
						role="student"
						triggerButtonText="Importation en masse"
						onSuccess={fetchData}
					/>
					<Button
						onClick={() => {
							resetForm();
							setIsDialogOpen(true);
						}}
					>
						<Plus className="h-4 w-4" /> Nouvel Étudiant
					</Button>
				</div>
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
							{selectedStudent ? "Modifier" : "Ajouter"} Étudiant
						</DialogTitle>
						<DialogDescription>
							Remplissez les informations académiques de l'étudiant.
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
								<FieldLabel>CNE</FieldLabel>
								<Input
									value={formData.cne}
									onChange={(e) =>
										setFormData({ ...formData, cne: e.target.value })
									}
									required
								/>
							</Field>
							<Field>
								<FieldLabel>Niveau</FieldLabel>
								<Select
									value={levels.find((l) => l.id === formData.levelId)?.name || ""}
									onValueChange={(name) => {
										const level = levels.find((l) => l.name === name);
										setFormData({ ...formData, levelId: level?.id || "" });
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir un niveau" />
									</SelectTrigger>
									<SelectContent>
										{levels.map((n) => (
											<SelectItem key={n.id} value={n.name}>
												{n.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field className="col-span-2">
								<FieldLabel>Filière</FieldLabel>
								<Select
									value={filieres.find((f) => f.id === formData.filiereId)?.name || ""}
									onValueChange={(name) => {
										const filiere = filieres.find((f) => f.name === name);
										setFormData({ ...formData, filiereId: filiere?.id || "" });
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Choisir une filière" />
									</SelectTrigger>
									<SelectContent>
										{filieres.map((f) => (
											<SelectItem key={f.id} value={f.name}>
												{f.name}
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
							Supprimer l'étudiant {selectedStudent?.lastName}{" "}
							{selectedStudent?.firstName} ?
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
