import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";

import {
  useStudents, useMajors, useLevels,
} from "@/hooks/use-queries";
import { type Student } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { BatchActionsBar } from "@/components/admin/BatchActionsBar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useStudentCrud } from "@/hooks/entities/use-student-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";

const FILTER_LIMIT = 5000;

export default function Students() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  const { data: studentsData, isLoading, refetch } = useStudents({
    page: isFiltering ? 0 : pagination.pageIndex,
    limit: isFiltering ? FILTER_LIMIT : pagination.pageSize,
  });
  const { data: majors = [] } = useMajors();
  const { data: levels = [] } = useLevels();
  const crud = useStudentCrud();

  const data = studentsData?.items ?? [];
  const pageCount = studentsData?.pageCount ?? 0;

  const columns = useMemo<ColumnDef<Student>[]>(() => [
    { accessorKey: "cne", header: "CNE", cell: ({ row }) => <code className="font-bold">{row.getValue("cne")}</code> },
    { accessorKey: "lastName", header: "Nom", cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div> },
    { accessorKey: "firstName", header: "Prénom", cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div> },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "majorId",
      header: "Filière",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const id = row.getValue("majorId") as string;
        return majors.find((f) => f.id === id)?.name || id;
      },
    },
    {
      accessorKey: "levelId",
      header: "Niveau",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const id = row.getValue("levelId") as string;
        const name = levels.find((l) => l.id === id)?.name || id;
        return <Badge variant="secondary">{name}</Badge>;
      },
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
      header: "",
      cell: ({ row }) => (
        <div className="text-right">
          <CrudActions entity={row.original} onEdit={crud.openEdit} onDelete={crud.openDelete} />
        </div>
      ),
    },
  ], [crud, majors, levels]);

  if (majors.length === 0 || levels.length === 0) {
    const parts: string[] = [];
    if (majors.length === 0) parts.push("filières");
    if (levels.length === 0) parts.push("niveaux");
    return (
      <div className="space-y-6">
        <EmptyState
          icon={GraduationCap}
          title="Configuration requise"
          description={`Vous devez d'abord configurer ${parts.join(" et ")} avant de pouvoir gérer les étudiants.`}
          action={<Button asChild><Link to="/admin/config">Configurer</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground">Gestion des inscriptions et profils étudiants.</p>
        </div>
        <div className="flex gap-2">
          <BulkImportDialog entity="student" triggerButtonText="Importation en masse" onSuccess={refetch} />
          <Button onClick={crud.openCreate}>
            <Plus className="size-4" /> Nouvel Étudiant
          </Button>
        </div>
      </div>

        <DataTable columns={columns} data={data} loading={isLoading} getRowId={(row) => row.id} enableRowSelection onSelectedRowsChange={setSelectedStudents}
          manualPagination={!isFiltering} pageCount={!isFiltering ? pageCount : undefined}
          pagination={!isFiltering ? pagination : undefined} onPaginationChange={!isFiltering ? setPagination : undefined}
          onFiltering={setIsFiltering}
          filterColumns={["lastName", "firstName", "email"]} filterPlaceholder="Rechercher par nom, prénom ou email..."
          filters={[
            { column: "majorId", label: "Filière", options: majors.map(f => ({ value: String(f.id), label: f.name })) },
            { column: "levelId", label: "Niveau", options: levels.map(l => ({ value: String(l.id), label: l.name })) },
          ]} />

      <BatchActionsBar
        selectedCount={selectedStudents.length}
        entityLabel="étudiant(s)"
        actions={[{ key: "major", label: "Modifier la filière" }, { key: "level", label: "Modifier le niveau" }, { key: "delete", label: "Supprimer" }]}
        fieldOptionsMap={{
          major: majors.map((f) => ({ value: f.id, label: f.name })),
          level: levels.map((l) => ({ value: l.id, label: l.name })),
        }}
        onUpdateField={async (field, value) => {
          if (field === "major") {
            await Promise.all(selectedStudents.map((s) => crud.updateMutation(s.id, { majorId: value, role: "student" as const })));
          } else if (field === "level") {
            await Promise.all(selectedStudents.map((s) => crud.updateMutation(s.id, { levelId: value, role: "student" as const })));
          }
        }}
        onDeleteSelected={async () => {
          await Promise.all(selectedStudents.map((s) => crud.deleteMutation(s.id)));
        }}
        isPending={crud.isPending}
        onClearSelection={() => setSelectedStudents([])}
      />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{crud.selected ? "Modifier" : "Ajouter"} Étudiant</DialogTitle>
            <DialogDescription>Remplissez les informations académiques de l'étudiant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={crud.handleSubmit}>
            <FieldGroup className="grid grid-cols-2 gap-4 py-4">
              <Field>
                <FieldLabel>Nom</FieldLabel>
                <Input value={crud.formData.lastName}
                  onChange={(e) => crud.setFormData({ ...crud.formData, lastName: e.target.value })}
                  required error={crud.fieldErrors?.lastName} />
              </Field>
              <Field>
                <FieldLabel>Prénom</FieldLabel>
                <Input value={crud.formData.firstName}
                  onChange={(e) => crud.setFormData({ ...crud.formData, firstName: e.target.value })}
                  required error={crud.fieldErrors?.firstName} />
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Email</FieldLabel>
                <Input type="email" value={crud.formData.email}
                  onChange={(e) => crud.setFormData({ ...crud.formData, email: e.target.value })}
                  required error={crud.fieldErrors?.email} />
              </Field>
              <Field>
                <FieldLabel>CNE</FieldLabel>
                <Input value={crud.formData.cne}
                  onChange={(e) => crud.setFormData({ ...crud.formData, cne: e.target.value })}
                  required error={crud.fieldErrors?.cne} />
              </Field>
              <Field>
                <FieldLabel>Niveau</FieldLabel>
                <Select value={crud.formData.levelId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, levelId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
                  <SelectContent>
                    {levels.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.levelId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.levelId}</p>}
              </Field>
              <Field className="col-span-2">
                <FieldLabel>Filière</FieldLabel>
                <Select value={crud.formData.majorId}
                  onValueChange={(v) => crud.setFormData({ ...crud.formData, majorId: v || "" })}>
              <SelectTrigger><SelectValue placeholder="Choisir une filière" /></SelectTrigger>
                  <SelectContent>
                    {majors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {crud.fieldErrors?.majorId && <p className="text-sm font-medium text-destructive">{crud.fieldErrors.majorId}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" isLoading={crud.isPending} loadingText="Enregistrement...">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert isOpen={crud.isDeleteDialogOpen} onOpenChange={crud.setIsDeleteDialogOpen}
        onDelete={crud.handleDelete} entityName={crud.selected ? `${crud.selected.lastName} ${crud.selected.firstName}` : undefined} isPending={crud.isPending} />
    </div>
  );
}
