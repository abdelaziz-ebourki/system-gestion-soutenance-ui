import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, wasExpired } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    if (wasExpired) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user!.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
