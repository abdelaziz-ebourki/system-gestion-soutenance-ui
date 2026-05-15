"use client";

import * as React from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

import {
	getCoordinators,
	createUser,
	updateUser,
	deleteUser,
} from "@/lib/api";
import { type Coordinator } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Coordinators() {
	const [data, setData] = React.useState<Coordinator[]>([]);
	const [pageCount, setPageCount] = React.useState(0);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [selectedCoord, setSelectedCoord] = React.useState<Coordinator | null>(
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
		password: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchCoordinators = async () => {
		setIsLoading(true);
		try {
			const result = await getCoordinators(
				pagination.pageIndex,
				pagination.pageSize,
			);
			setData(result.items);
			setPageCount(result.pageCount);
		} catch {
			toast.error("Erreur lors du chargement des coordinateurs");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchCoordinators();
	}, [pagination]);

	const resetForm = () => {
		setFormData({ lastName: "", firstName: "", email: "", password: "" });
		setSelectedCoord(null);
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		try {
			await createUser({ ...formData, role: "coordinator", isActive: true });
			toast.success("Coordinateur ajouté avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchCoordinators();
		} catch {
			toast.error("Erreur lors de la création");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async () => {
		if (!selectedCoord) return;
		setIsSubmitting(true);
		try {
			const updateData = { ...formData, role: "coordinator" as const };
			if (!updateData.password) delete (updateData as any).password;

			await updateUser(selectedCoord.id, updateData);
			toast.success("Profil coordinateur mis à jour");
			setIsDialogOpen(false);
			resetForm();
			fetchCoordinators();
		} catch {
			toast.error("Erreur lors de la modification");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (selectedCoord) handleUpdate();
		else handleCreate();
	};

	const handleDelete = async () => {
		if (!selectedCoord) return;
		setIsDeleting(true);
		try {
			await deleteUser(selectedCoord.id);
			toast.success("Coordinateur supprimé");
			fetchCoordinators();
		} catch {
			toast.error("Erreur lors de la suppression");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedCoord(null);
		}
	};

	const columns: ColumnDef<Coordinator>[] = [
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
			accessorKey: "isActive",
			header: "Statut",
			cell: ({ row }) => (
				<Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
					{row.getValue("isActive") ? "Actif" : "Inactif"}
				</Badge>
			),
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const coord = row.original;
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
										setSelectedCoord(coord);
										setFormData({
											lastName: coord.lastName,
											firstName: coord.firstName,
											email: coord.email,
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
										setSelectedCoord(coord);
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
					<h1 className="text-3xl font-bold tracking-tight">Coordinateurs</h1>
					<p className="text-muted-foreground">
						Gestion des responsables de filières.
					</p>
				</div>
				<Button
					onClick={() => {
						resetForm();
						setIsDialogOpen(true);
					}}
				>
					<Plus className="h-4 w-4" /> Nouveau Coordinateur
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
							{selectedCoord ? "Modifier" : "Ajouter"} Coordinateur
						</DialogTitle>
						<DialogDescription>
							Compte administratif de gestion de filière.
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
							<Field className="col-span-2">
								<FieldLabel>
									Mot de passe{" "}
									{selectedCoord && "(laisser vide pour ne pas changer)"}
								</FieldLabel>
								<Input
									type="password"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									required={!selectedCoord}
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
							Supprimer {selectedCoord?.lastName} {selectedCoord?.firstName} ?
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
