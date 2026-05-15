import * as React from "react";
import { FolderKanban, Mail, UserRound, Users } from "lucide-react";

import { getStudentGroup } from "@/lib/api";
import type { StudentGroupDetails } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function StudentGroup() {
	const [group, setGroup] = React.useState<StudentGroupDetails | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				setGroup(await getStudentGroup());
			} catch {
				toast.error("Erreur lors du chargement du groupe");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

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
								{isLoading ? "..." : group?.groupName}
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
								{isLoading ? "..." : group?.members.length}
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
								{isLoading ? "..." : group?.supervisorName}
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
							Le sujet actuellement rattache a votre groupe.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-2xl border p-5">
							<p className="text-sm text-muted-foreground">Titre</p>
							<p className="mt-2 text-xl font-semibold">
								{isLoading ? "Chargement..." : group?.projectTitle}
							</p>
							<div className="mt-4">
								<Badge className="bg-secondary text-secondary-foreground">
									{group?.supervisorName}
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
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
