import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	BookOpen,
	Calendar,
	Settings,
	LogOut,
	Menu,
	X,
	DoorOpen,
	ClipboardList,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

export default function DashboardLayout() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const filteredNavItems = navItems.filter(
		(item) => user && item.roles.includes(user.role),
	);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="min-h-screen bg-background flex flex-col md:flex-row">
			{/* Mobile Sidebar Toggle */}
			<div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="Logo" className="h-8 w-8" />
					<span className="font-heading font-bold text-xl">SG Soutenances</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
				>
					{isSidebarOpen ? <X /> : <Menu />}
				</Button>
			</div>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="h-full flex flex-col bg-[#f8f9fa] dark:bg-slate-900">
					<div className="p-6 flex items-center gap-3">
						<img src="/logo.svg" alt="Logo" className="h-10 w-10 shadow-lg" />
						<div className="flex flex-col">
							<span className="font-heading font-bold text-lg leading-none">
								SG Soutenances
							</span>
							<span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
								Academic Portal
							</span>
						</div>
					</div>

					<Separator className="mx-6 w-auto opacity-50" />

					<nav className="flex-1 px-4 py-6 space-y-1">
						{filteredNavItems.map((item) => {
							const isActive =
								location.pathname === item.href ||
								(item.href !== "/" && location.pathname.startsWith(item.href));
							return (
								<Link
									key={item.href}
									to={item.href}
									onClick={() => setIsSidebarOpen(false)}
									className={cn(
										"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
										isActive
											? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
											: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
									)}
								>
									<item.icon
										className={cn(
											"h-4 w-4",
											isActive
												? "text-white"
												: "text-slate-400 group-hover:text-primary",
										)}
									/>
									{item.title}
								</Link>
							);
						})}
					</nav>

					<div className="p-4 mt-auto">
						<div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
							<div className="flex items-center gap-3 mb-4">
								<Avatar className="h-10 w-10 ring-2 ring-primary/10">
									<AvatarFallback className="bg-primary/10 text-primary font-bold">
										{user?.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="overflow-hidden">
									<p className="text-sm font-bold truncate">{user?.name}</p>
									<p className="text-[10px] text-primary font-bold uppercase tracking-tighter">
										{user?.role}
									</p>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start gap-2 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive"
								onClick={handleLogout}
							>
								<LogOut className="h-3.5 w-3.5" />
								Déconnexion
							</Button>
						</div>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950">
				{/* Top Navbar */}
				<header className="hidden md:flex h-16 items-center justify-between px-8 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
					<div className="flex items-center gap-2 text-slate-400 text-sm font-sans">
						<span className="hover:text-primary cursor-pointer transition-colors">
							Portail Académique
						</span>
						<span className="text-slate-300">/</span>
						<span className="text-slate-900 dark:text-slate-100 font-semibold capitalize">
							{location.pathname === "/"
								? "Tableau de bord"
								: location.pathname
										.split("/")
										.filter(Boolean)
										.pop()
										?.replace("-", " ")}
						</span>
					</div>

					<div className="flex items-center gap-6">
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="text-slate-500 hover:text-primary"
							>
								<Settings className="h-5 w-5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="text-slate-500 hover:text-primary relative"
							>
								<span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-white dark:ring-slate-900" />
								<ClipboardList className="h-5 w-5" />
							</Button>
						</div>

						<Separator orientation="vertical" className="h-8 opacity-50" />

						<div className="flex items-center gap-3">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-bold leading-none">{user?.name}</p>
								<p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
									{user?.email}
								</p>
							</div>
							<Avatar className="h-9 w-9 ring-2 ring-primary/5 transition-transform hover:scale-105 cursor-pointer">
								<AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
									{user?.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto">
					<div className="container max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
						<Outlet />
					</div>
				</main>
			</div>

			{/* Mobile Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</div>
	);
}
