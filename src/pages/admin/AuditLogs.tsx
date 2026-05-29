import { useAuditLogs } from "@/hooks/use-queries";
import type { AuditLog } from "@/types/audit-log";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";

export default function AuditLogs() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const { data, isLoading } = useAuditLogs(pagination.pageIndex, pagination.pageSize);

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
        data={data?.items ?? []}
        loading={isLoading}
        getRowId={(row) => String(row.id)}
        filterColumns="action"
        filterPlaceholder="Rechercher une action..."
        manualPagination
        pageCount={data?.pageCount ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
