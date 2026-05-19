"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Layers,
  BookOpen,
  Settings,
} from "lucide-react";

import {
  type DefenseSettings,
} from "@/lib/api";
import { type Filiere, type Level, type Grade } from "@/types";
import {
  useFilieres, useCreateFiliere, useUpdateFiliere, useDeleteFiliere,
  useLevels, useCreateLevel, useUpdateLevel, useDeleteLevel,
  useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade,
  useDefenseSettings, useUpdateDefenseSettings,
} from "@/hooks/use-queries";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Skeleton,
} from "@/components/ui";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { validate, configNameSchema, defenseSettingsSchema } from "@/lib/validations";

type ConfigType = "filiere" | "level" | "grade";

export default function Configuration() {
  const { data: filieres } = useFilieres();
  const { data: levels } = useLevels();
  const { data: grades } = useGrades();
  const { data: defSettings, isLoading } = useDefenseSettings();
  const createFiliereMut = useCreateFiliere();
  const updateFiliereMut = useUpdateFiliere();
  const deleteFiliereMut = useDeleteFiliere();
  const createLevelMut = useCreateLevel();
  const updateLevelMut = useUpdateLevel();
  const deleteLevelMut = useDeleteLevel();
  const createGradeMut = useCreateGrade();
  const updateGradeMut = useUpdateGrade();
  const deleteGradeMut = useDeleteGrade();
  const updateSettingsMut = useUpdateDefenseSettings();

  const [settings, setSettings] = React.useState<DefenseSettings>({
    startTime: "08:00",
    endTime: "18:00",
    defenseDuration: 30,
    breakDuration: 15,
    groupCreationStartDate: "2026-05-01",
    groupCreationEndDate: "2026-06-20",
  });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [settingsFieldErrors, setSettingsFieldErrors] = React.useState<Record<string, string>>({});

  const [activeType, setActiveType] = React.useState<ConfigType>("filiere");
  const [selectedItem, setSelectedItem] = React.useState<Filiere | Level | Grade | null>(null);
  const [formData, setFormData] = React.useState({ name: "" });

  React.useEffect(() => {
    if (defSettings) {
      setSettings(defSettings);
    }
  }, [defSettings]);

  const isSubmitting =
    (activeType === "filiere" && (selectedItem ? updateFiliereMut.isPending : createFiliereMut.isPending)) ||
    (activeType === "level" && (selectedItem ? updateLevelMut.isPending : createLevelMut.isPending)) ||
    (activeType === "grade" && (selectedItem ? updateGradeMut.isPending : createGradeMut.isPending));

  const isDeleting =
    (activeType === "filiere" && deleteFiliereMut.isPending) ||
    (activeType === "level" && deleteLevelMut.isPending) ||
    (activeType === "grade" && deleteGradeMut.isPending);

  const handleOpenDialog = (type: ConfigType, item: Filiere | Level | Grade | null = null) => {
    setActiveType(type);
    setSelectedItem(item);
    setFormData({ name: item?.name || "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const errors = validate(configNameSchema, formData);
    if (errors) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      if (selectedItem) {
        if (activeType === "filiere")
          await updateFiliereMut.mutateAsync({ id: selectedItem.id, data: formData });
        else if (activeType === "level")
          await updateLevelMut.mutateAsync({ id: selectedItem.id, data: formData });
        else
          await updateGradeMut.mutateAsync({ id: selectedItem.id, data: formData });
        toast.success("Modifié avec succès");
      } else {
        if (activeType === "filiere") await createFiliereMut.mutateAsync(formData);
        else if (activeType === "level") await createLevelMut.mutateAsync(formData);
        else await createGradeMut.mutateAsync(formData);
        toast.success("Ajouté avec succès");
      }
      setIsDialogOpen(false);
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      if (activeType === "filiere") await deleteFiliereMut.mutateAsync(selectedItem.id);
      else if (activeType === "level") await deleteLevelMut.mutateAsync(selectedItem.id);
      else await deleteGradeMut.mutateAsync(selectedItem.id);
      toast.success("Supprimé avec succès");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSettingsUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const errors = validate(defenseSettingsSchema, settings);
    if (errors) { setSettingsFieldErrors(errors); return; }
    setSettingsFieldErrors({});
    try {
      await updateSettingsMut.mutateAsync(settings);
      toast.success("Paramètres mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour des paramètres");
    }
  };

  const renderConfigCard = (
    title: string,
    description: string,
    items: Array<{ id: string; name: string }>,
    type: ConfigType,
    icon: React.ReactNode,
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {icon} {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog(type)}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">{item.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenDialog(type, item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    setActiveType(type);
                    setSelectedItem(item);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2">
              Aucun élément configuré.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Gérez les entités fondamentales du système.
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {renderConfigCard(
            "Filières",
            "Liste des filières disponibles.",
            filieres ?? [],
            "filiere",
            <BookOpen className="h-5 w-5" />,
          )}
          {renderConfigCard(
            "Niveaux",
            "Cycles universitaires.",
            levels ?? [],
            "level",
            <Layers className="h-5 w-5" />,
          )}
          {renderConfigCard(
            "Grades",
            "Titres académiques.",
            grades ?? [],
            "grade",
            <GraduationCap className="h-5 w-5" />,
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Paramètres des Soutenances
              </CardTitle>
              <CardDescription>
                Définissez les créneaux horaires globaux.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsUpdate} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Début de journée</FieldLabel>
                    <Input
                      type="time"
                      value={settings.startTime}
                      onChange={(e) =>
                        setSettings({ ...settings, startTime: e.target.value })
                      }
                      required
                      error={settingsFieldErrors?.startTime}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Fin de journée</FieldLabel>
                    <Input
                      type="time"
                      value={settings.endTime}
                      onChange={(e) =>
                        setSettings({ ...settings, endTime: e.target.value })
                      }
                      required
                      error={settingsFieldErrors?.endTime}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Durée soutenance (min)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.defenseDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defenseDuration: parseInt(e.target.value),
                        })
                      }
                      required
                      error={settingsFieldErrors?.defenseDuration}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Durée repos (min)</FieldLabel>
                    <Input
                      type="number"
                      value={settings.breakDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          breakDuration: parseInt(e.target.value),
                        })
                      }
                      required
                      error={settingsFieldErrors?.breakDuration}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Début création groupes</FieldLabel>
                    <Input
                      type="date"
                      value={settings.groupCreationStartDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          groupCreationStartDate: e.target.value,
                        })
                      }
                      required
                      error={settingsFieldErrors?.groupCreationStartDate}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Fin création groupes</FieldLabel>
                    <Input
                      type="date"
                      value={settings.groupCreationEndDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          groupCreationEndDate: e.target.value,
                        })
                      }
                      required
                      error={settingsFieldErrors?.groupCreationEndDate}
                    />
                  </Field>
                </div>
                <Button
                  type="submit"
                  className="mt-2"
                  isLoading={updateSettingsMut.isPending}
                  loadingText="Sauvegarde en cours..."
                >
                  Sauvegarder
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Modifier" : "Ajouter"}{" "}
              {activeType === "filiere"
                ? "Filière"
                : activeType === "level"
                  ? "Niveau"
                  : "Grade"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Nom / Libellé</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  error={fieldErrors?.name}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Enregistrement..."
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer cet élément ? Cela pourrait affecter les utilisateurs
              liés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
