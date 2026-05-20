import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui";
import { RotateCcw } from "lucide-react";

interface DataTableFilter {
  column: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumns?: string | string[];
  filterPlaceholder?: string;
  filters?: DataTableFilter[];
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumns,
  filterPlaceholder = "Rechercher...",
  filters,
  manualPagination = false,
  pageCount,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const searchCols = React.useMemo(
    () => (typeof filterColumns === "string" ? [filterColumns] : filterColumns),
    [filterColumns],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination,
    pageCount,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: searchCols
      ? (row, _id, value) => {
          const query = String(value).toLowerCase();
          return searchCols.some((colId) => {
            const val = row.getValue(colId);
            return String(val ?? "").toLowerCase().includes(query);
          });
        }
      : undefined,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: pagination ?? internalPagination,
    },
  });

  const hasActiveFilters =
    columnFilters.length > 0 || globalFilter.length > 0;

  const totalPages = table.getPageCount();

  React.useEffect(() => {
    table.setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, globalFilter]);

  return (
    <div>
      {searchCols || filters?.length ? (
        <div className="flex flex-wrap items-center gap-4 py-4">
          {searchCols && (
            <Input
              placeholder={filterPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          )}
          {filters?.map((f) => {
            const column = table.getColumn(f.column);
            if (!column) return null;
            const currentValue = (column.getFilterValue() as string) ?? "";
            return (
              <Select
                key={f.column}
                value={currentValue}
                onValueChange={(v) =>
                  column.setFilterValue(v || undefined)
                }
              >
                <SelectTrigger className="w-44">
                  <span className="flex-1 text-left truncate">
                    {currentValue
                      ? f.options.find((o) => o.value === currentValue)
                          ?.label ?? currentValue
                      : f.label}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    Tous les {f.label.toLowerCase()}
                  </SelectItem>
                  {f.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                table.resetColumnFilters();
              }}
            >
              <RotateCcw className="mr-1 size-3" />
              Effacer les filtres
            </Button>
          )}
        </div>
      ) : null}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {header.column.getIsSorted() === "asc"
                      ? " \u2191"
                      : null}
                    {header.column.getIsSorted() === "desc"
                      ? " \u2193"
                      : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} sur {totalPages}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          {totalPages > 1 &&
            getPageNumbers(
              table.getState().pagination.pageIndex + 1,
              totalPages,
            ).map((page, i) =>
              page === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={
                    page === table.getState().pagination.pageIndex + 1
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="min-w-9"
                  onClick={() => table.setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              ),
            )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
