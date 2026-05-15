import * as React from "react";
import { FolderKanban, Mail, Plus, UserRound, Users } from "lucide-react";

import {
	createStudentGroup,
	getStudentGroup,
	joinStudentGroup,
} from "@/lib/api";
import type { StudentGroupWorkspace } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function StudentGroup() {
	const [workspace, setWorkspace] = React.useState<StudentGroupWorkspace | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const loadWorkspace = async () => {
		setIsLoading(true);
		try {
			setWorkspace(await getStudentGroup());
		} catch {
			toast.error("Erreur lors du chargement du groupe");
		} finally {
			setIsLoading(false);
		}
	};

	React.useEffect(() => {
		loadWorkspace();
	}, []);

	const handleCreateGroup = async () => {
		setIsSubmitting(true);
		try {
			await createStudentGroup();
			toast.success("Votre groupe a ete cree automatiquement");
			await loadWorkspace();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Erreur lors de la creation";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleJoinGroup = async (groupId: string) => {
		setIsSubmitting(true);
		try {
			await joinStudentGroup(groupId);
			toast.success("Vous avez rejoint le groupe selectionne");
			await loadWorkspace();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Erreur lors de la jonction";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const group = workspace?.currentGroup || null;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Mon groupe</h1>
				<p className="text-muted-foreground">
					Consultez la composition de votre groupe et les informations du projet.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Nom du groupe</p>
							<p className="mt-2 text-xl font-semibold">
								{isLoading ? "..." : group?.groupName || "Aucun groupe"}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<Users className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Membres</p>
							<p className="mt-2 text-3xl font-semibold">
								{isLoading ? "..." : group?.members.length || 0}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<UserRound className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Encadrant</p>
							<p className="mt-2 text-xl font-semibold">
								{isLoading ? "..." : group?.supervisorName || "En attente"}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<FolderKanban className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Projet affecte</CardTitle>
						<CardDescription>
							Le sujet actuellement rattache a votre groupe, lorsque l'affectation existe.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-2xl border p-5">
							<p className="text-sm text-muted-foreground">Titre</p>
							<p className="mt-2 text-xl font-semibold">
								{isLoading ? "Chargement..." : group?.projectTitle || "Projet non affecte"}
							</p>
							<div className="mt-4">
								<Badge className="bg-secondary text-secondary-foreground">
									{group?.supervisorName || "Encadrant en attente"}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle>Membres du groupe</CardTitle>
						<CardDescription>
							La repartition actuelle de votre equipe.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{group?.members.map((member) => (
							<div key={member.id} className="rounded-2xl border p-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-medium">{member.fullName}</p>
										<p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
											<Mail className="size-3.5" />
											{member.email}
										</p>
									</div>
									<Badge variant="outline">
										{member.role === "leader" ? "Chef de groupe" : "Membre"}
									</Badge>
								</div>
							</div>
						))}
						{!isLoading && !group && (
							<div className="rounded-2xl border bg-secondary/40 p-4 text-sm text-muted-foreground">
								Vous n'appartenez a aucun groupe pour le moment.
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle>Fenetre de creation des groupes</CardTitle>
					<CardDescription>
						Les groupes sont nommes automatiquement par le systeme: Groupe-1, Groupe-2, etc.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-2xl border p-4 text-sm text-muted-foreground">
						Periode autorisee: {workspace?.groupCreationStartDate} au{" "}
						{workspace?.groupCreationEndDate}
					</div>
					{workspace?.isGroupCreationOpen ? (
						<div className="flex flex-wrap gap-3">
							<Button onClick={handleCreateGroup} disabled={Boolean(group) || isSubmitting}>
								<Plus className="mr-2 size-4" />
								Creer un groupe
							</Button>
						</div>
					) : (
						<div className="rounded-2xl border bg-destructive/10 p-4 text-sm text-destructive">
							La creation et la jonction des groupes sont actuellement fermees.
						</div>
					)}

					{workspace && workspace.availableGroups.length > 0 && !group && (
						<div className="space-y-3">
							<p className="text-sm font-medium">Groupes disponibles</p>
							{workspace.availableGroups.map((availableGroup) => (
								<div
									key={availableGroup.id}
									className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
								>
									<div>
										<p className="font-medium">{availableGroup.groupName}</p>
										<p className="text-sm text-muted-foreground">
											{availableGroup.memberCount} membre(s)
										</p>
									</div>
									<Button
										variant="outline"
										onClick={() => handleJoinGroup(availableGroup.id)}
										disabled={!workspace.isGroupCreationOpen || isSubmitting}
									>
										Rejoindre
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
