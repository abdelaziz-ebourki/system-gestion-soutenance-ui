import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { getAuditLogs } from "@/lib/api";
import type { AuditLog } from "@/types/audit-log";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AuditLogs() {
	const [data, setData] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchLogs = async () => {
		setIsLoading(true);
		try {
			const result = await getAuditLogs();
			setData(result);
		} catch {
			toast.error("Erreur lors du chargement des logs");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, []);

	const columns: ColumnDef<AuditLog>[] = [
		{
			accessorKey: "timestamp",
			header: "Date",
			cell: ({ row }) => format(new Date(row.original.timestamp), "dd/MM/yyyy HH:mm"),
		},
		{
			accessorKey: "adminEmail",
			header: "Admin",
		},
		{
			accessorKey: "action",
			header: "Action",
			cell: ({ row }) => (
				<Badge variant="outline" className="font-mono">{row.original.action}</Badge>
			),
		},
		{
			accessorKey: "entity",
			header: "Entité",
		},
		{
			accessorKey: "details",
			header: "Détails",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
				<p className="text-muted-foreground">
					Historique des actions administratives système.
				</p>
			</div>

			{isLoading ? (
				<div className="flex h-64 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable
					columns={columns}
					data={data}
					filterColumn="adminEmail"
					filterPlaceholder="Rechercher par admin..."
				/>
			)}
		</div>
	);
}
