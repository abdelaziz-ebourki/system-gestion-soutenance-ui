"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
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
} from "@/components/ui/dropdown-menu";
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

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar?: string;
	};
}) {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const { setTheme, theme } = useTheme();

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		localStorage.removeItem("expiresAt");
		toast.success("Déconnexion réussie");
		navigate("/login");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
						}
					>
						<Avatar className="size-8 rounded-lg grayscale">
							<AvatarImage src={user.avatar} alt={user.name} />
							<AvatarFallback className="rounded-lg bg-primary/10 text-primary">
								{user.name.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{user.name}</span>
							<span className="truncate text-xs text-foreground/70">
								{user.email}
							</span>
						</div>
						<EllipsisVerticalIcon className="ml-auto size-4" />
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
										<AvatarImage src={user.avatar} alt={user.name} />
										<AvatarFallback className="rounded-lg bg-primary/10 text-primary">
											{user.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-xs text-muted-foreground">
											{user.email}
										</span>
									</div>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem className="cursor-pointer">
								<CircleUserRoundIcon className="size-4" />
								Mon Profil
							</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer">
								<BellIcon className="size-4" />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="cursor-pointer">
									<SunIcon className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
									<MoonIcon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
									<span>Thème</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											onClick={() => setTheme("light")}
											className="cursor-pointer justify-between"
										>
											<div className="flex items-center">
												<SunIcon className="mr-2 h-4 w-4" />
												Clair
											</div>
											{theme === "light" && <CheckIcon className="h-4 w-4" />}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setTheme("dark")}
											className="cursor-pointer justify-between"
										>
											<div className="flex items-center">
												<MoonIcon className="mr-2 h-4 w-4" />
												Sombre
											</div>
											{theme === "dark" && <CheckIcon className="h-4 w-4" />}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setTheme("system")}
											className="cursor-pointer justify-between"
										>
											<div className="flex items-center">
												<MonitorIcon className="mr-2 h-4 w-4" />
												Système
											</div>
											{theme === "system" && <CheckIcon className="h-4 w-4" />}
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
						>
							<LogOutIcon className="size-4" />
							Se déconnecter
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
