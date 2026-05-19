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
