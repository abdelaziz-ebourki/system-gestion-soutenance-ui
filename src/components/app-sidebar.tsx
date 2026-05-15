"use client";

import { siteConfig } from "@/config/site";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	LayoutDashboardIcon,
	UsersIcon,
	Settings2Icon,
	CalendarIcon,
	BookOpenIcon,
	GraduationCapIcon,
	FileTextIcon,
	BuildingIcon,
	HistoryIcon,
	LayersIcon,
	University,
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const userStr = localStorage.getItem("user");
	const user = userStr
		? JSON.parse(userStr)
		: { lastName: "Guest", firstName: "", email: "", role: "guest", avatar: "" };

	const getNavItems = (role: string) => {
		switch (role) {
			case "admin":
				return [
					{ title: "Dashboard", url: "/admin", icon: <LayoutDashboardIcon /> },
					{
						title: "Départements",
						url: "/admin/departments",
						icon: <University />,
					},
					{
						title: "Salles",
						url: "/admin/rooms",
						icon: <BuildingIcon />,
					},
					{
						title: "Sessions",
						url: "/admin/sessions",
						icon: <LayersIcon />,
					},
					{
						title: "Utilisateurs",
						url: "#",
						icon: <UsersIcon />,
						items: [
							{
								title: "Étudiants",
								url: "/admin/users/students",
							},
							{
								title: "Enseignants",
								url: "/admin/users/teachers",
							},
							{
								title: "Coordinateurs",
								url: "/admin/users/coordinators",
							},
						],
					},
					{
						title: "Configuration",
						url: "/admin/config",
						icon: <Settings2Icon />,
					},
					{ title: "Audit Logs", url: "/admin/audit", icon: <HistoryIcon /> },
				];
			case "coordinator":
				return [
					{
						title: "Dashboard",
						url: "/coordinator",
						icon: <LayoutDashboardIcon />,
					},
					{
						title: "Projets & Groupes",
						url: "/coordinator/projects",
						icon: <BookOpenIcon />,
					},
					{
						title: "Planification",
						url: "/coordinator/schedule",
						icon: <CalendarIcon />,
					},
					{ title: "Jurys", url: "/coordinator/jurys", icon: <UsersIcon /> },
				];
			case "teacher":
				return [
					{
						title: "Mon Dashboard",
						url: "/teacher",
						icon: <LayoutDashboardIcon />,
					},
					{
						title: "Mon Planning",
						url: "/teacher/schedule",
						icon: <CalendarIcon />,
					},
					{
						title: "Évaluations",
						url: "/teacher/evaluations",
						icon: <GraduationCapIcon />,
					},
					{
						title: "Mes Indisponibilités",
						url: "/teacher/unavailability",
						icon: <HistoryIcon />,
					},
				];
			case "student":
				return [
					{
						title: "Ma Soutenance",
						url: "/student",
						icon: <GraduationCapIcon />,
					},
					{ title: "Mon Groupe", url: "/student/group", icon: <UsersIcon /> },
					{
						title: "Documents",
						url: "/student/documents",
						icon: <FileTextIcon />,
					},
				];
			default:
				return [];
		}
	};

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="py-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							className="data-[slot=sidebar-menu-button]:p-1.5!"
							render={<a href="/" />}
						>
							<img src="/logo.svg" alt="Logo" className="size-10" />
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold text-lg tracking-tight">
									{siteConfig.name}
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={getNavItems(user.role)} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
