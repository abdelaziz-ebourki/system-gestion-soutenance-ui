import { FolderKanban, Mail, Plus, UserRound, Users } from "lucide-react";

import {
  useStudentGroup,
  useCreateStudentGroup,
  useJoinStudentGroup,
} from "@/hooks/use-queries";
import { toast } from "sonner";
import { toastError } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
} from "@/components/ui";

export default function StudentGroup() {
  const { data: workspace, isLoading } = useStudentGroup();
  const createGroup = useCreateStudentGroup();
  const joinGroup = useJoinStudentGroup();

  const isSubmitting = createGroup.isPending || joinGroup.isPending;

  const handleCreateGroup = async () => {
    try {
      await createGroup.mutateAsync();
      toast.success("Votre groupe a été créé automatiquement");
    } catch (error) {
      toastError(error, "Erreur lors de la création");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup.mutateAsync(groupId);
      toast.success("Vous avez rejoint le groupe sélectionné");
    } catch (error) {
      toastError(error, "Erreur lors de la jonction");
    }
  };

  const group = workspace?.currentGroup || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon groupe</h1>
        <p className="text-muted-foreground">
          Consultez la composition de votre groupe et les informations du
          projet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          label="Nom du groupe"
          value={isLoading ? "..." : group?.groupName || "Aucun groupe"}
          icon={Users}
          valueClassName="text-xl font-semibold"
        />
        <StatsCard label="Membres" value={isLoading ? "..." : group?.members.length || 0} icon={UserRound} />
        <StatsCard
          label="Encadrant"
          value={isLoading ? "..." : group?.supervisorName || "En attente"}
          icon={FolderKanban}
          valueClassName="text-xl font-semibold"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Projet affecté</CardTitle>
            <CardDescription>
              Le sujet actuellement rattaché à votre groupe, lorsque
              l'affectation existe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">Titre</p>
              <p className="mt-2 text-xl font-semibold">
                {isLoading
                  ? "Chargement..."
                  : group?.projectTitle || "Projet non affecté"}
              </p>
              <div className="mt-4">
                <Badge variant="secondary">
                  {group?.supervisorName || "Encadrant en attente"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membres du groupe</CardTitle>
            <CardDescription>
              La répartition actuelle de votre équipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {group?.members.map((member) => (
              <div key={member.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-3.5" />
                      {member.email}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {member.role === "leader"
                      ? "Responsable de groupe"
                      : "Membre"}
                  </Badge>
                </div>
              </div>
            ))}
            {!isLoading && !group && (
              <div className="rounded-lg border bg-secondary/40 p-4 text-sm text-muted-foreground">
                Vous n'appartenez à aucun groupe pour le moment.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fenêtre de création des groupes</CardTitle>
          <CardDescription>
            Les groupes sont nommés automatiquement par le système: Groupe-1,
            Groupe-2, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Période autorisée: {workspace?.groupCreationStartDate} au{" "}
            {workspace?.groupCreationEndDate}
          </div>
          {workspace?.isGroupCreationOpen ? (
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCreateGroup}
                isLoading={isSubmitting}
                disabled={Boolean(group)}
              >
                <Plus className="mr-2 size-4" />
                Créer un groupe
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">
              La création et la jonction des groupes sont actuellement fermées.
            </div>
          )}

          {workspace && workspace.availableGroups.length > 0 && !group && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Groupes disponibles</p>
              {workspace.availableGroups.map((availableGroup) => (
                <div
                  key={availableGroup.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{availableGroup.groupName}</p>
                    <p className="text-sm text-muted-foreground">
                      {availableGroup.memberCount} membre(s)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleJoinGroup(availableGroup.id)}
                    isLoading={isSubmitting}
                    disabled={!workspace.isGroupCreationOpen}
                  >
                    Rejoindre
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
