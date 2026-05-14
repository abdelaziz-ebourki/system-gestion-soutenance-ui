import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const expiresAt = localStorage.getItem("expiresAt");
  const user = userStr ? JSON.parse(userStr) : null;

  const isExpired = expiresAt ? Date.now() > Number.parseInt(expiresAt) : true;

  if (!token || !user || isExpired) {
    if (isExpired && token) {
      localStorage.removeItem("token");
      localStorage.setItem("user", "");
      localStorage.removeItem("expiresAt");
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
