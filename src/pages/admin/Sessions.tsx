"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
	Plus,
	MoreHorizontal,
	Pencil,
	Trash2,
	Calendar,
	Loader2,
} from "lucide-react";

import {
	getSessions,
	createSession,
	updateSession,
	deleteSession,
} from "@/lib/api";
import type { Session } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuGroup,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Sessions() {
	const [data, setData] = React.useState<Session[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [selectedSession, setSelectedSession] = React.useState<Session | null>(
		null,
	);

	// Form state
	const [formData, setFormData] = React.useState<Omit<Session, "id">>({
		name: "",
		type: "Normale",
		status: "draft",
		startDate: "",
		endDate: "",
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const fetchSessions = async () => {
		setIsLoading(true);
		try {
			const result = await getSessions();
			setData(result);
		} catch {
			toast.error("Erreur lors du chargement des sessions");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		fetchSessions();
	}, []);

	const resetForm = () => {
		setFormData({
			name: "",
			type: "Normale",
			status: "draft",
			startDate: "",
			endDate: "",
		});
		setSelectedSession(null);
	};

	const handleCreateSession = async () => {
		setIsSubmitting(true);
		try {
			await createSession(formData);
			toast.success("Session créée avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchSessions();
		} catch {
			toast.error("Erreur lors de la création de la session");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateSession = async () => {
		if (!selectedSession) return;
		setIsSubmitting(true);
		try {
			await updateSession(selectedSession.id, formData);
			toast.success("Session modifiée avec succès");
			setIsDialogOpen(false);
			resetForm();
			fetchSessions();
		} catch {
			toast.error("Erreur lors de la modification de la session");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (selectedSession) {
			handleUpdateSession();
		} else {
			handleCreateSession();
		}
	};

	const handleDelete = async () => {
		if (!selectedSession) return;
		setIsDeleting(true);
		try {
			await deleteSession(selectedSession.id);
			toast.success("Session supprimée");
			fetchSessions();
		} catch {
			toast.error("Erreur lors de la suppression de la session");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedSession(null);
		}
	};

	const columns: ColumnDef<Session>[] = [
		{
			accessorKey: "name",
			header: "Nom de la Session",
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="outline" className="rounded-md">
					{row.getValue("type")}
				</Badge>
			),
		},
		{
			accessorKey: "status",
			header: "Statut",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={status === "active" ? "default" : "secondary"}
						className="rounded-md capitalize"
					>
						{status === "active"
							? "Active"
							: status === "draft"
								? "Brouillon"
								: "Archivée"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "startDate",
			header: "Début",
			cell: ({ row }) => (
				<div className="flex items-center text-muted-foreground">
					<Calendar className="mr-2 h-3 w-3" />
					{row.getValue("startDate")}
				</div>
			),
		},
		{
			accessorKey: "endDate",
			header: "Fin",
			cell: ({ row }) => (
				<div className="flex items-center text-muted-foreground">
					<Calendar className="mr-2 h-3 w-3" />
					{row.getValue("endDate")}
				</div>
			),
		},
		{
			id: "actions",
			header: "Action",
			cell: ({ row }) => {
				const session = row.original;

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
									onClick={() => navigator.clipboard.writeText(session.id)}
								>
									Copier l'ID
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setSelectedSession(session);
										setFormData({
											name: session.name,
											type: session.type,
											status: session.status,
											startDate: session.startDate,
											endDate: session.endDate,
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
										setSelectedSession(session);
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
					<h1 className="text-3xl font-bold tracking-tight">
						Sessions Globales
					</h1>
					<p className="text-muted-foreground">
						Définissez les périodes académiques pour les soutenances.
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
								<Plus className="mr-2 h-4 w-4" />
								Nouvelle Session
							</Button>
						}
					/>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{selectedSession ? "Modifier la session" : "Créer une Session"}
							</DialogTitle>
							<DialogDescription>
								{selectedSession
									? "Mettez à jour les informations de la session."
									: "Configurez une nouvelle période de soutenance."}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit}>
							<FieldGroup className="py-4">
								<Field>
									<FieldLabel>Nom de la Session</FieldLabel>
									<Input
										placeholder="ex: Session Normale 2026"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</Field>
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel>Type</FieldLabel>
										<Select
											value={formData.type}
											onValueChange={(val) =>
												setFormData({ ...formData, type: val ?? "Normale" })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Choisir un type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Normale">Normale</SelectItem>
												<SelectItem value="Rattrapage">Rattrapage</SelectItem>
												<SelectItem value="Spéciale">Spéciale</SelectItem>
											</SelectContent>
										</Select>
									</Field>
									<Field>
										<FieldLabel>Statut Initial</FieldLabel>
										<Select
											value={
												formData.status === "active"
													? "Active"
													: formData.status === "draft"
														? "Brouillon"
														: "Archivée"
											}
											onValueChange={(val) =>
												setFormData({
													...formData,
													status: val === "Active" ? "active" : "draft",
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Choisir un statut" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Brouillon">Brouillon</SelectItem>
												<SelectItem value="Active">Active</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel>Date de début</FieldLabel>
										<Input
											type="date"
											value={formData.startDate}
											onChange={(e) =>
												setFormData({
													...formData,
													startDate: e.target.value,
												})
											}
											required
										/>
									</Field>
									<Field>
										<FieldLabel>Date de fin</FieldLabel>
										<Input
											type="date"
											value={formData.endDate}
											onChange={(e) =>
												setFormData({
													...formData,
													endDate: e.target.value,
												})
											}
											required
										/>
									</Field>
								</div>
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
							Cette action est irréversible. La session "{selectedSession?.name}
							" sera définitivement supprimée.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
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
					filterPlaceholder="Rechercher une session..."
				/>
			)}
		</div>
	);
}
