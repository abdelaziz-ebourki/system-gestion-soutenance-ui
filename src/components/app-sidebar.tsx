import * as React from "react";
import {
	LayoutDashboard,
	Users,
	BookOpen,
	Calendar,
	DoorOpen,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";

interface NavItem {
	title: string;
	href: string;
	icon: React.ElementType;
	roles: UserRole[];
}

const navItems: NavItem[] = [
	{
		title: "Tableau de bord",
		href: "/",
		icon: LayoutDashboard,
		roles: ["STUDENT", "TEACHER", "COORDINATOR", "ADMIN"],
	},
	{
		title: "Planning",
		href: "/coordinator",
		icon: Calendar,
		roles: ["COORDINATOR"],
	},
	{
		title: "Mes Évaluations",
		href: "/teacher",
		icon: BookOpen,
		roles: ["TEACHER"],
	},
	{
		title: "Utilisateurs",
		href: "/admin",
		icon: Users,
		roles: ["ADMIN"],
	},
	{
		title: "Gestion des Salles",
		href: "/admin",
		icon: DoorOpen,
		roles: ["ADMIN"],
	},
	{
		title: "Sessions",
		href: "/admin",
		icon: Calendar,
		roles: ["ADMIN"],
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useAuth();

	const filteredNavItems = navItems.filter(
		(item) => user && item.roles.includes(user.role),
	);

	return (
		<Sidebar collapsible="icon" {...props} className="border-r border-border/50">
			<SidebarHeader className="p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
							<div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/5">
								<img src="/logo.svg" alt="Logo" className="h-6 w-6" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight ml-2">
								<span className="truncate font-heading font-bold text-lg text-foreground tracking-tight">
									SG Soutenances
								</span>
								<span className="truncate text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-0.5">
									Portail Académique
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="px-2">
				<NavMain items={filteredNavItems} />
			</SidebarContent>
			<SidebarFooter className="p-4 border-t border-border/50">
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
