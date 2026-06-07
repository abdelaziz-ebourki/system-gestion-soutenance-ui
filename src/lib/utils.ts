import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ApiError } from "@/lib/api-error"
import type { SlotKey } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim()
}

export function createSlotKey(date: string, room: string, time: string): SlotKey {
  return `${date}|${room}|${time}` as SlotKey;
}

export function parseSlotKey(key: string): { date: string; room: string; time: string } {
  const [date, room, time] = key.split("|");
  if (!date || !room || !time) {
    throw new Error(`Invalid slot key format: ${key}. Expected 'date|room|time'`);
  }
  return { date, room, time };
}

const API_ERROR_MESSAGES: Record<number, string> = {
  400: "La requête est invalide.",
  401: "Session expirée. Veuillez vous reconnecter.",
  403: "Accès refusé.",
  404: "Ressource introuvable.",
  409: "Conflit avec l'état actuel de la ressource.",
  422: "Données invalides.",
  429: "Trop de requêtes. Veuillez réessayer plus tard.",
  500: "Erreur serveur. Veuillez réessayer plus tard.",
  502: "Service temporairement indisponible.",
  503: "Service temporairement indisponible.",
};

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError) {
    if (error.isTimeout) {
      return "La requête a expiré. Veuillez réessayer.";
    } else if (error.isNetworkError) {
      return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    } else if (error.status && API_ERROR_MESSAGES[error.status]) {
      if (error.status === 422 && error.fieldErrors) {
        const fieldList = Object.entries(error.fieldErrors)
          .slice(0, 3)
          .map(([, msg]) => msg);
        return fieldList.join("\n");
      } else {
        return API_ERROR_MESSAGES[error.status];
      }
    } else {
      return error.message || fallbackMessage;
    }
  }

  return error instanceof Error
    ? error.message
    : fallbackMessage;
}
