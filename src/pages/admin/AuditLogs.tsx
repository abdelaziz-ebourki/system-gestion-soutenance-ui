import { useAuditLogs } from "@/hooks/use-queries";
import type { AuditLog } from "@/types/audit-log";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export default function AuditLogs() {
  const { data: logs = [], isLoading } = useAuditLogs();

  const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: "action", header: "Action" },
    { accessorKey: "entity", header: "Entité" },
    { accessorKey: "adminEmail", header: "Utilisateur" },
    { accessorKey: "timestamp", header: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journal d'audit</h1>
        <p className="text-muted-foreground">
          Consultez l'historique des actions administratives.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        getRowId={(row) => row.id}
        filterColumns="action"
        filterPlaceholder="Rechercher une action..."
      />
    </div>
  );
}
