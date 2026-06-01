
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  BellIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  CheckIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useUnreadCount } from "@/hooks/use-queries";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/config/routes";

export function NavUser({
  user,
}: {
  user: {
    lastName: string;
    firstName: string;
    email: string;
    avatar?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { logout } = useAuth();

  const displayName = `${user.lastName} ${user.firstName}`.trim() || "User";
  const initials = displayName.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AlertDialog>
          <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-muted"
                data-testid="nav-user-trigger"
              >
                <Avatar className="size-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-foreground/70">
                    {user.email}
                  </span>
                </div>
                <EllipsisVerticalIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar} alt={displayName} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(ROUTES.SHARED.PROFILE)} data-testid="nav-user-profile">
                  <CircleUserRoundIcon className="size-4" />
                  Mon Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(ROUTES.SHARED.NOTIFICATIONS)} data-testid="nav-user-notifications">
                  <BellIcon className="size-4" />
                  Notifications
                  <UnreadBadge />
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <SunIcon className="mr-2 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute mr-2 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Thème</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="cursor-pointer justify-between"
                      >
                        <div className="flex items-center">
                          <SunIcon className="mr-2 size-4" />
                          Clair
                        </div>
                        {theme === "light" && <CheckIcon className="size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="cursor-pointer justify-between"
                      >
                        <div className="flex items-center">
                          <MoonIcon className="mr-2 size-4" />
                          Sombre
                        </div>
                        {theme === "dark" && <CheckIcon className="size-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("system")}
                        className="cursor-pointer justify-between"
                      >
                        <div className="flex items-center">
                          <MonitorIcon className="mr-2 size-4" />
                          Système
                        </div>
                        {theme === "system" && (
                          <CheckIcon className="size-4" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive" className="cursor-pointer" data-testid="nav-user-logout-trigger">
                  <LogOutIcon className="size-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent data-testid="nav-user-logout-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Déconnexion</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous
                reconnecter pour accéder au système.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="nav-user-logout-cancel">Annuler</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleLogout} data-testid="nav-user-logout-confirm">
                Se déconnecter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UnreadBadge() {
  const count = useUnreadCount();
  if (count === 0) return null;
  return (
    <Badge className="ml-auto size-5 rounded-full p-0 text-[10px] leading-none" variant="destructive">
      {count > 9 ? "9+" : count}
    </Badge>
  );
}
