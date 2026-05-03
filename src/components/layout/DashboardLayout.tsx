import { useLocation, Outlet } from "react-router-dom";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DashboardLayout() {
	const location = useLocation();

	const currentPageTitle =
		location.pathname === "/"
			? "Tableau de bord"
			: location.pathname.split("/").filter(Boolean).pop()?.replace("-", " ") ||
				"";

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="bg-background">
				{/* Header */}
				<header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-40 no-print">
					<div className="flex items-center gap-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/" className="text-[10px] font-bold uppercase tracking-widest">Université</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage className="font-heading text-sm normal-case tracking-tight">{currentPageTitle}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto custom-scrollbar">
					<div className="container max-w-7xl mx-auto p-6 md:p-10">
						<Outlet />
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
