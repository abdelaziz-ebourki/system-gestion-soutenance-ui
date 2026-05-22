export interface AuditLog {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT" | "LOGIN";
  entity: "user" | "room" | "department" | "session" | "config" | "project" | "group" | "jury" | "grade" | "document" | "defense" | "defense_session" | "jury_role_template";
  entityId: string;
  adminEmail: string;
  details: string;
  timestamp: string;
}
