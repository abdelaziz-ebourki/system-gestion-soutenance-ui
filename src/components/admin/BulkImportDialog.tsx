import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Loader2, Upload, FileUp, AlertCircle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { bulkCreateUsers, bulkCreateRooms } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportDialogProps {
	entity: "student" | "teacher" | "coordinator" | "room";
	triggerButtonText?: string;
	onSuccess?: () => void;
}

const ENTITY_HEADERS: Record<string, string[]> = {
	student: ["prénom", "nom", "email", "cne", "filière", "niveau"],
	teacher: ["prénom", "nom", "email", "département", "grade"],
	room: ["nom", "bâtiment", "capacité"],
};

export function BulkImportDialog({
	entity,
	triggerButtonText = "Importation en masse",
	onSuccess,
}: BulkImportDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [data, setData] = useState<any[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const parseFile = (selectedFile: File) => {
		setFile(selectedFile);
		const reader = new FileReader();
		reader.onload = (evt) => {
			const bstr = evt.target?.result;
			const wb = XLSX.read(bstr, { type: "binary" });
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			const rawData = XLSX.utils.sheet_to_json(ws) as any[];

			const mappedData = rawData.map((item) => {
				const newItem: any = {};
				Object.keys(item).forEach((key) => {
					const normalizedKey = key.toLowerCase().trim();
					if (normalizedKey === "prénom") newItem.firstName = item[key];
					else if (normalizedKey === "nom") newItem.lastName = item[key];
					else if (normalizedKey === "email") newItem.email = item[key];
					else if (normalizedKey === "cne") newItem.cne = item[key];
					else if (normalizedKey === "filière") newItem.filiereName = item[key];
					else if (normalizedKey === "niveau") newItem.levelName = item[key];
					else if (normalizedKey === "département") newItem.departmentName = item[key];
					else if (normalizedKey === "grade") newItem.gradeName = item[key];
					else if (normalizedKey === "nom") newItem.name = item[key];
					else if (normalizedKey === "bâtiment") newItem.building = item[key];
					else if (normalizedKey === "capacité") newItem.capacity = item[key];
					else newItem[normalizedKey] = item[key];
				});
				return newItem;
			});

			setData(mappedData);
		};
		reader.readAsBinaryString(selectedFile);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFile = e.dataTransfer.files?.[0];
		if (droppedFile) parseFile(droppedFile);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			if (entity === "room") {
				await bulkCreateRooms(data);
			} else {
				await bulkCreateUsers(data, entity);
			}
			toast.success(`${data.length} éléments importés avec succès.`);
			setIsOpen(false);
			setFile(null);
			setData([]);
			onSuccess?.();
		} catch {
			toast.error("Échec de l'importation.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger>
				<Button variant="outline">
					<FileUp className="mr-2 h-4 w-4" />
					{triggerButtonText}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Importation en masse : {entity}</DialogTitle>
					<DialogDescription>
						Téléchargez un fichier Excel pour importer plusieurs {entity}s à la
						fois.
					</DialogDescription>
				</DialogHeader>

				<Alert className="mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Le fichier Excel doit contenir les colonnes suivantes :
						<span className="font-semibold block mt-1">
							{ENTITY_HEADERS[entity]?.join(", ")}
						</span>
					</AlertDescription>
				</Alert>

				<div className="grid gap-4">
					<div
						className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
							isDragging
								? "border-primary bg-primary/5"
								: "border-gray-300 bg-gray-50 hover:bg-gray-100"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
					>
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<Upload className="w-8 h-8 mb-2 text-gray-500" />
							<p className="text-sm text-gray-500">
								{file
									? file.name
									: "Glissez-déposez ou cliquez pour télécharger le fichier"}
							</p>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							className="hidden"
							accept=".xlsx, .xls"
							onChange={(e) =>
								e.target.files?.[0] && parseFile(e.target.files[0])
							}
						/>
					</div>

					{data.length > 0 && (
						<div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
							{data.length} enregistrements trouvés.
						</div>
					)}
				</div>
				<DialogFooter>
					<Button onClick={handleSubmit} disabled={!file || isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Importer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
