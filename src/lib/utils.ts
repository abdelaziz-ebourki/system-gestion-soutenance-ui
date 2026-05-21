import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim()
}

export function toastError(error: unknown, fallbackMessage: string) {
  const message =
    error instanceof Error
      ? error.message
      : fallbackMessage
  toast.error(message)
}
