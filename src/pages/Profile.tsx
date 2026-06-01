import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  coordinator: "Coordinateur",
  teacher: "Enseignant",
  student: "Étudiant",
};

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <Skeleton className="h-48 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="profile-header">Mon Profil</h1>
        <p className="text-muted-foreground" data-testid="profile-description">Informations personnelles de votre compte.</p>
      </div>

      <Card data-testid="profile-card">
        <CardHeader>
          <CardTitle>Identité</CardTitle>
          <CardDescription>Les informations associées à votre compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2" data-testid="profile-field-name">
            <p className="text-sm font-medium">Nom complet</p>
            <p className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</p>
          </div>
          <div className="grid gap-2" data-testid="profile-field-email">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="grid gap-2" data-testid="profile-field-role">
            <p className="text-sm font-medium">Rôle</p>
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
