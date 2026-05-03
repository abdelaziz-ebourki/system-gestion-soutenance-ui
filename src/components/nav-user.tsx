import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CaretUpDownIcon, SignOutIcon, UserIcon, BellIcon, GearIcon } from "@phosphor-icons/react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg border border-primary/10">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-foreground">{user.name}</span>
                <span className="truncate text-[10px] text-primary font-bold uppercase tracking-tighter">{user.role}</span>
              </div>
              <CaretUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl shadow-2xl border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2.5 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-lg border border-primary/10">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer">
                <UserIcon className="size-4 text-slate-500" />
                <span className="font-medium">Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer">
                <BellIcon className="size-4 text-slate-500" />
                <span className="font-medium">Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 py-2.5 rounded-lg cursor-pointer">
                <GearIcon className="size-4 text-slate-500" />
                <span className="font-medium">Paramètres</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
              onClick={handleLogout}
            >
              <SignOutIcon className="size-4" />
              <span className="font-bold">Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
