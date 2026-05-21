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
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: { data?: { message?: string } } }).response?.data?.message === "string"
      ? (error as { response: { data: { message: string } } }).response.data.message
      : fallbackMessage
  toast.error(message)
}
