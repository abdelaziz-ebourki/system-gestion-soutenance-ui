import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullName<T extends { lastName: string; firstName: string }>(
  user?: T,
): string {
  return user ? `${user.lastName} ${user.firstName}` : "";
}

export function toastError(error: unknown, fallback: string) {
  const message =
    error instanceof Error ? error.message : fallback;
  toast.error(message);
}
