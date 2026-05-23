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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useStudentCrud } from "@/hooks/entities/use-student-crud";
import { CrudActions } from "@/components/admin/CrudActions";
import { DeleteAlert } from "@/components/admin/DeleteAlert";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const FILTER_LIMIT = 5000;

export default function Students() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [batchDialog, setBatchDialog] = useState<"major" | "level" | "delete" | null>(null);
  const [batchValue, setBatchValue] = useState("");

  const { data: studentsData, isLoading, refetch } = useStudents(
    isFiltering ? 0 : pagination.pageIndex,
    isFiltering ? FILTER_LIMIT : pagination.pageSize,
  );
  const { data: majors = [] } = useMajors();
  const { data: levels = [] } = useLevels();
  const crud = useStudentCrud();

  const data = studentsData?.items ?? [];
  const pageCount = studentsData?.pageCount ?? 0;

  const columns = useMemo<ColumnDef<Student>[]>(() => [
    { accessorKey: "cne", header: "CNE", cell: ({ row }) => <code className="font-bold">{row.getValue("cne")}</code> },
    { accessorKey: "lastName", header: "Nom", cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div> },
    { accessorKey: "firstName", header: "Prénom", cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div> },
    {
      accessorKey: "majorId",
      header: "Filière",
      cell: ({ row }) => {
        const id = row.getValue("majorId") as string;
        return majors.find((f) => f.id === id)?.name || id;
      },
    },
    {
      accessorKey: "levelId",
      header: "Niveau",
      cell: ({ row }) => {
        const id = row.getValue("levelId") as string;
        const name = levels.find((l) => l.id === id)?.name || id;
        return <Badge variant="secondary">{name}</Badge>;
      },
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

  const missingMajors = majors.length === 0;
  const missingLevels = levels.length === 0;
  if (missingMajors || missingLevels) {
    const parts: string[] = [];
    if (missingMajors) parts.push("filières");
    if (missingLevels) parts.push("niveaux");
    return (
      <div className="space-y-6">
        <EmptyState
          icon={GraduationCap}
          title="Configuration requise"
          description={`Vous devez d'abord configurer ${parts.join(" et ")} avant de pouvoir gérer les étudiants.`}
          action={
            <div className="flex gap-2">
              {missingMajors && <Button asChild><Link to="/admin/config">Filières</Link></Button>}
              {missingLevels && <Button asChild><Link to="/admin/config">Niveaux</Link></Button>}
            </div>
          }
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
            { column: "majorId", label: "Filière", options: majors.map(f => ({ value: f.id, label: f.name })) },
            { column: "levelId", label: "Niveau", options: levels.map(l => ({ value: l.id, label: l.name })) },
          ]} />

      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
          <span className="text-sm font-medium">
            {selectedStudents.length} étudiant(s) sélectionné(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setBatchDialog("major"); setBatchValue(""); }}>
              Modifier la filière
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setBatchDialog("level"); setBatchValue(""); }}>
              Modifier le niveau
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setBatchDialog("delete")}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={batchDialog === "major"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la filière</DialogTitle>
            <DialogDescription>
              {selectedStudents.length} étudiant(s) sélectionné(s). Choisissez la nouvelle filière.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choisir une major" /></SelectTrigger>
              <SelectContent>
                {majors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
            <Button onClick={async () => {
              if (!batchValue) return;
              try {
                await Promise.all(selectedStudents.map((s) => crud.updateMutation(s.id, { majorId: batchValue, role: "student" as const })));
                toast.success(`${selectedStudents.length} étudiant(s) mis à jour`);
                setSelectedStudents([]);
                setBatchDialog(null);
                refetch();
              } catch {
                toast.error("Erreur lors de la mise à jour");
              }
            }} isLoading={crud.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDialog === "level"} onOpenChange={(o) => { if (!o) setBatchDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le niveau</DialogTitle>
            <DialogDescription>
              {selectedStudents.length} étudiant(s) sélectionné(s). Choisissez le nouveau niveau.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={batchValue} onValueChange={(v) => setBatchValue(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choisir un niveau" /></SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialog(null)}>Annuler</Button>
            <Button onClick={async () => {
              if (!batchValue) return;
              try {
                await Promise.all(selectedStudents.map((s) => crud.updateMutation(s.id, { levelId: batchValue, role: "student" as const })));
                toast.success(`${selectedStudents.length} étudiant(s) mis à jour`);
                setSelectedStudents([]);
                setBatchDialog(null);
                refetch();
              } catch {
                toast.error("Erreur lors de la mise à jour");
              }
            }} isLoading={crud.isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={batchDialog === "delete"}
        onOpenChange={(o) => { if (!o) setBatchDialog(null); }}
        entityName={`${selectedStudents.length} étudiant(s)`}
        onDelete={async () => {
          try {
            await Promise.all(selectedStudents.map((s) => crud.deleteMutation(s.id)));
            toast.success(`${selectedStudents.length} étudiant(s) supprimé(s)`);
            setSelectedStudents([]);
            setBatchDialog(null);
            refetch();
          } catch {
            toast.error("Erreur lors de la suppression");
          }
        }}
        isPending={crud.isPending}
      />

      <Dialog open={crud.isDialogOpen} onOpenChange={crud.setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{crud.selected ? "Modifier" : "Ajouter"} Étudiant</DialogTitle>
            <DialogDescription>Remplissez les informations académiques de l'étudiant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); crud.handleSubmit(); }}>
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
