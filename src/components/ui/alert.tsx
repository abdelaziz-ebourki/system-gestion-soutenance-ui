import * as React from "react";
import { cn } from "@/lib/utils";

function Alert({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & { variant?: "default" | "destructive" }) {
	return (
		<div
			data-slot="alert"
			data-variant={variant}
			className={cn(
				"relative w-full rounded-2xl border px-4 py-3 text-sm",
				variant === "destructive"
					? "border-destructive/20 bg-destructive/10 text-destructive"
					: "border-border bg-muted/40 text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn("text-sm leading-relaxed opacity-90", className)}
			{...props}
		/>
	);
}

export { Alert, AlertDescription, AlertTitle };
