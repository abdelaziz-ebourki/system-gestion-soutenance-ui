import { Link, useLocation } from "react-router-dom";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		href: string;
		icon?: React.ElementType;
	}[];
}) {
	const location = useLocation();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-2">
				Menu Principal
			</SidebarGroupLabel>

			<SidebarMenu className="gap-1">
				{items.map((item) => {
					const isActive =
						location.pathname === item.href ||
						(item.href !== "/" && location.pathname.startsWith(item.href));

					return (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={isActive}
								className={cn(
									"h-11 px-4 rounded-xl transition-all duration-200 group",
									isActive
										? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								)}
							>
								<Link to={item.href} className="flex items-center gap-3">
									{item.icon && (
										<item.icon
											className={cn(
												"h-4 w-4 transition-colors",
												isActive
													? "text-primary"
													: "text-muted-foreground group-hover:text-accent-foreground",
											)}
										/>
									)}

									<span className="font-bold text-sm tracking-tight">
										{item.title}
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
