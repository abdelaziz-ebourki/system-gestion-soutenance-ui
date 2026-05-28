import { Fragment } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
} from "@/components/ui";
import { Outlet, useLocation, Link } from "react-router-dom";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  "audit-logs": "Audit Log",
  config: "Configuration",
  conflicts: "Conflits",
  coordinator: "Coordinateur",
  "defense-sessions": "Sessions de soutenance",
  departments: "Départements",
  documents: "Documents",
  evaluations: "Évaluations",
  group: "Groupe",
  juries: "Jurys",
  notifications: "Notifications",
  profile: "Profil",
  projects: "Projets & Groupes",
  rooms: "Salles",
  schedule: "Planification",
  sessions: "Sessions",
  student: "Étudiant",
  students: "Étudiants",
  teacher: "Enseignant",
  teachers: "Enseignants",
  coordinators: "Coordinateurs",
  unavailability: "Indisponibilités",
  users: "Utilisateurs",
};

const VALID_ROUTES = new Set([
  "/admin",
  "/admin/audit-logs",
  "/admin/config",
  "/admin/departments",
  "/admin/rooms",
  "/admin/sessions",
  "/admin/users/students",
  "/admin/users/teachers",
  "/admin/users/coordinators",
  "/coordinator",
  "/coordinator/conflicts",
  "/coordinator/juries",
  "/coordinator/projects",
  "/coordinator/schedule",
  "/notifications",
  "/profile",
  "/student",
  "/student/documents",
  "/student/group",
  "/teacher",
  "/teacher/evaluations",
  "/teacher/schedule",
  "/teacher/unavailability",
]);

export default function DashboardLayout() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const label = SEGMENT_LABELS[segment] || segment;
    const path = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const isLinkable = VALID_ROUTES.has(path);
    return { label, path, isLast, isLinkable };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={crumb.path}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage className="font-heading font-bold uppercase tracking-widest text-xs text-muted-foreground">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : crumb.isLinkable ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.path}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-muted-foreground">{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
