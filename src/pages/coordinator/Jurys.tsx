import { useMemo } from "react";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, UserPlus, Users, AlertTriangle } from "lucide-react";

import { useJurys, useProjects, useTeachersList } from "@/hooks/use-queries";
import type { Jury } from "@/types";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { DataTable } from "@/components/ui/data-table";
import { CreateJuryDialog } from "@/components/academic/CreateJuryDialog";

export default function Jurys() {
  const jurysQuery = useJurys();
  const teachersQuery = useTeachersList();
  const projectsQuery = useProjects();
  const jurys = jurysQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const isLoading = jurysQuery.isLoading || teachersQuery.isLoading || projectsQuery.isLoading;
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const teachersLoad = React.useMemo(() => {
    const counts = new Map<string, number>();
    jurys.forEach((jury) => {
      [jury.presidentId, jury.reporterId, jury.examinerId].forEach(
        (teacherId) => {
          counts.set(teacherId, (counts.get(teacherId) || 0) + 1);
        },
      );
    });
    return counts;
  }, [jurys]);

  const projectsWithoutJury = useMemo(() => projects.filter(
    (project) => !jurys.some((jury) => jury.projectId === project.id),
  ), [projects, jurys]);

  const columns: ColumnDef<Jury>[] = [
    {
      accessorKey: "projectTitle",
      header: "Projet",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.projectTitle}</div>
          <div className="text-xs text-muted-foreground">
            {projects
              .find((project) => project.id === row.original.projectId)
              ?.studentNames?.join(", ") || "Groupe non renseigne"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "presidentName",
      header: "President",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">P</Badge>
          <span>{row.original.presidentName}</span>
        </div>
      ),
    },
    {
      accessorKey: "reporterName",
      header: "Rapporteur",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">R</Badge>
          <span>{row.original.reporterName}</span>
        </div>
      ),
    },
    {
      accessorKey: "examinerName",
      header: "Examinateur",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="default">E</Badge>
          <span>{row.original.examinerName}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des jurys
          </h1>
          <p className="text-muted-foreground">
            Composez des jurys lisibles, repartissez la charge et fermez les
            trous avant la planification.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <UserPlus className="size-4" />
          Nouveau jury
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Jurys composes</p>
              <p className="mt-2 text-3xl font-semibold">{jurys.length}</p>
            </div>
            <div className="rounded-lg bg-primary p-3 text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Projets sans jury</p>
              <p className="mt-2 text-3xl font-semibold">
                {projectsWithoutJury.length}
              </p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Enseignants mobilises
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {Array.from(teachersLoad.keys()).length}/{teachers.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-primary">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Composition des jurys</CardTitle>
            <CardDescription>
              Chaque ligne correspond a un projet avec son trio de soutenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Chargement des jurys...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={jurys}
                filterColumn="projectTitle"
                filterPlaceholder="Rechercher un projet..."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charge enseignants</CardTitle>
            <CardDescription>
              Un apercu rapide pour eviter de surcharger toujours les memes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teachers.length > 0 ? (
              teachers.map((teacher) => {
              const fullName = `${teacher.lastName} ${teacher.firstName}`;
              const load = teachersLoad.get(teacher.id) || 0;

              return (
                <div key={teacher.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email}
                      </p>
                    </div>
                    <Badge>
                      {load} affectation{load > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              );
            })
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun enseignant à afficher.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateJuryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
