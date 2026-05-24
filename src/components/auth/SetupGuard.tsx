import { Navigate, Outlet } from "react-router-dom";
import { useGeneralSettings } from "@/hooks/use-queries";

export default function SetupGuard() {
  const { data: settings, isLoading } = useGeneralSettings();

  if (isLoading) return null;

  if (settings && !settings.setupCompleted) {
    return <Navigate to="/admin/setup" replace />;
  }

  return <Outlet />;
}
