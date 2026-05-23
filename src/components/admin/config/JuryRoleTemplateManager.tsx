import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Users, Pencil } from "lucide-react";

import {
  useJuryRoleTemplates,
  useCreateJuryRoleTemplate,
  useUpdateJuryRoleTemplate,
  useDeleteJuryRoleTemplate,
} from "@/hooks/use-queries";
import type { JuryRoleTemplate, DefenseType } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const DEFENSE_TYPES: { value: DefenseType; label: string }[] = [
  { value: "pfe", label: "PFE" },
  { value: "memoire", label: "Mémoire" },
  { value: "these", label: "Thèse" },
];

const DEFAULT_ROLES = [
  { name: "Président", count: 1, coefficient: 30 },
  { name: "Rapporteur", count: 1, coefficient: 35 },
  { name: "Examinateur", count: 1, coefficient: 35 },
];

export function JuryRoleTemplateManager() {
  const { data: templates = [], isLoading } = useJuryRoleTemplates();
  const createMutation = useCreateJuryRoleTemplate();
  const updateMutation = useUpdateJuryRoleTemplate();
  const deleteMutation = useDeleteJuryRoleTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JuryRoleTemplate | null>(null);
  const [name, setName] = useState("");
  const [defenseType, setDefenseType] = useState<string>("pfe");
  const [roles, setRoles] = useState<{ name: string; count: number; coefficient: number }[]>(DEFAULT_ROLES);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDefenseType("pfe");
    setRoles(DEFAULT_ROLES);
    setDialogOpen(true);
  };

  const openEdit = (t: JuryRoleTemplate) => {
    setEditing(t);
    setName(t.name);
    setDefenseType(t.defenseType);
    setRoles(t.roles.map((r) => ({ ...r })));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { name, defenseType, roles };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        toast.success("Template modifié");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Template créé");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const addRole = () => setRoles([...roles, { name: "", count: 1, coefficient: 25 }]);
  const removeRole = (i: number) => setRoles(roles.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: keyof typeof roles[number], value: string | number) => {
    const updated = [...roles];
    updated[i] = { ...updated[i], [field]: value };
    setRoles(updated);
  };

  const defenseTypeLabel = (dt: string) => DEFENSE_TYPES.find((d) => d.value === dt)?.label ?? dt;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" /> Templates de jury
            </CardTitle>
            <CardDescription>
              Définissez la composition des jurys (rôles, nombre et coefficients).
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {templates.length === 0 && !isLoading && (
              <p className="py-2 text-sm italic text-muted-foreground">Aucun template configuré.</p>
            )}
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {defenseTypeLabel(t.defenseType)}
                  </Badge>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.roles.map((r) => (
                      <Badge key={r.name} variant="outline" className="text-xs">
                        {r.count}x {r.name} ({r.coefficient}%)
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(t)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="size-8"
                    onClick={async () => {
                      try {
                        await deleteMutation.mutateAsync(t.id);
                        toast.success("Template supprimé");
                      } catch {
                        toast.error("Erreur");
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier" : "Créer"} un template de jury</DialogTitle>
            <DialogDescription>
              Configurez les rôles, leur nombre et leurs coefficients pour la composition des jurys.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nom du template"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="space-y-1">
              <Label>Type de soutenance</Label>
              <Select value={defenseType} onValueChange={setDefenseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFENSE_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              {roles.map((role, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    placeholder="Rôle"
                    value={role.name}
                    onChange={(e) => updateRole(i, "name", e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    value={role.count}
                    onChange={(e) => updateRole(i, "count", Number(e.target.value))}
                    className="w-16"
                  />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={role.coefficient}
                      onChange={(e) => updateRole(i, "coefficient", Number(e.target.value))}
                      className="w-16"
                    />
                    <span>%</span>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRole(i)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addRole}>
              <Plus className="mr-2 size-4" />
              Ajouter un rôle
            </Button>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
