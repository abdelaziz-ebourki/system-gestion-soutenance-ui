import { BellIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Restez informé des événements importants.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BellIcon className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">Aucune notification pour le moment</p>
          <p className="text-sm text-muted-foreground">
            Les notifications apparaîtront ici lorsqu'elles seront disponibles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
