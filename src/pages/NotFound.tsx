import { Button } from "@/components/ui";
import { FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <FileQuestion className="size-24 text-muted-foreground/50" />
        <h1 className="font-heading text-5xl font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">
          Page introuvable. La page que vous cherchez n'existe pas ou a été
          déplacée.
        </p>
        <Button onClick={() => navigate("/login")} variant="default" size="lg">
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
