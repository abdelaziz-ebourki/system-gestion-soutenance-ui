export interface AuditLog {
	id: string;
	action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT" | "LOGIN";
	entity: "user" | "room" | "department" | "session" | "config";
	entityId: string;
	adminEmail: string;
	details: string;
	timestamp: string;
}
