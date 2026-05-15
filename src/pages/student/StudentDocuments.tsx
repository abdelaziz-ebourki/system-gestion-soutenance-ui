import * as React from "react";
import {
	CalendarClock,
	FileCheck2,
	FileText,
	FolderArchive,
	Upload,
} from "lucide-react";

import { getStudentDocuments } from "@/lib/api";
import type { StudentDocument } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const documentIcons: Record<string, typeof FileText> = {
	Rapport: FileText,
	Presentation: FileCheck2,
	Archive: FolderArchive,
};

const statusLabel: Record<StudentDocument["status"], string> = {
	submitted: "Depose",
	validated: "Valide",
	missing: "Manquant",
};

const statusClass: Record<StudentDocument["status"], string> = {
	submitted: "bg-secondary text-secondary-foreground",
	validated: "bg-primary text-primary-foreground",
	missing: "bg-destructive/10 text-destructive",
};

export default function StudentDocuments() {
	const [documents, setDocuments] = React.useState<StudentDocument[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);
	const [isUploading, setIsUploading] = React.useState<Record<string, boolean>>(
		{},
	);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				setDocuments(await getStudentDocuments());
			} catch {
				toast.error("Erreur lors du chargement des documents");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleUpload = (documentId: string) => {
		setIsUploading((prev) => ({ ...prev, [documentId]: true }));
		setTimeout(() => {
			setIsUploading((prev) => ({ ...prev, [documentId]: false }));
			toast.success("Document envoye avec succes");
		}, 1500);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Documents</h1>
				<p className="text-muted-foreground">
					Suivez les depots attendus, les echeances et l'etat de validation.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Documents attendus
							</p>
							<p className="mt-2 text-3xl font-semibold">{documents.length}</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<FileText className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">Valides</p>
							<p className="mt-2 text-3xl font-semibold">
								{
									documents.filter(
										(document) => document.status === "validated",
									).length
								}
							</p>
						</div>
						<div className="rounded-2xl bg-secondary p-3 text-primary">
							<FileCheck2 className="size-5" />
						</div>
					</CardContent>
				</Card>
				<Card className="border-0 shadow-sm">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Échéances ouvertes
							</p>
							<p className="mt-2 text-3xl font-semibold">
								{
									documents.filter((document) => document.status === "missing")
										.length
								}
							</p>
						</div>
						<div className="rounded-2xl bg-destructive/10 p-3 text-destructive">
							<CalendarClock className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle>Suivi des pieces</CardTitle>
					<CardDescription>
						Vue consolidée des livrables attendus pour votre soutenance.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{isLoading ? (
						<div className="py-10 text-center text-sm text-muted-foreground">
							Chargement des documents...
						</div>
					) : (
						documents.map((document) => {
							const Icon = documentIcons[document.type] || FileText;

							return (
								<div key={document.id} className="rounded-2xl border p-4">
									<div className="flex flex-wrap items-center justify-between gap-4">
										<div className="flex items-start gap-3">
											<div className="rounded-2xl bg-secondary p-3 text-primary">
												<Icon className="size-5" />
											</div>
											<div>
												<p className="font-medium">{document.name}</p>
												<p className="mt-1 text-sm text-muted-foreground">
													Type: {document.type}
												</p>
											</div>
										</div>
										<Badge className={statusClass[document.status]}>
											{statusLabel[document.status]}
										</Badge>
									</div>
									<div className="mt-4 flex flex-wrap items-end justify-between gap-6">
										<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
											<span>Echeance: {document.deadline}</span>
											<span>Depot: {document.submittedAt || "Non depose"}</span>
										</div>
										{document.status === "missing" && (
											<div className="flex items-end gap-2">
												<div className="grid w-full max-w-sm items-center gap-1.5">
													<Label
														htmlFor={`file-${document.id}`}
														className="sr-only"
													>
														Fichier
													</Label>
													<Input id={`file-${document.id}`} type="file" />
												</div>
												<Button
													onClick={() => handleUpload(document.id)}
													disabled={isUploading[document.id]}
												>
													<Upload className="mr-2 size-4" />
													{isUploading[document.id] ? "Envoi..." : "Deposer"}
												</Button>
											</div>
										)}
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
