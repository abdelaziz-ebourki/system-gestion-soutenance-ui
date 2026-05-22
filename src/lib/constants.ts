export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  EXPIRES_AT: "expiresAt",
} as const;

export const DEFENSE_ROLE_LABELS: Record<string, string> = {
  president: "Président",
  reporter: "Rapporteur",
  examiner: "Examinateur",
  supervisor: "Encadrant",
};

export const DEFENSE_SESSION_LIFECYCLE: Record<string, string[]> = {
  draft: ["active"],
  active: ["scheduled"],
  scheduled: ["completed"],
  completed: ["archived"],
};

export const DEFENSE_SESSION_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  active: "Active",
  scheduled: "Planifiée",
  completed: "Terminée",
  archived: "Archivée",
};

export const DEFENSE_SESSION_STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  active: "default",
  scheduled: "outline",
  completed: "secondary",
  archived: "secondary",
};
