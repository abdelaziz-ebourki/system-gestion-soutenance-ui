import { http, HttpResponse, delay } from "msw";
import type { AuditLog } from "@/types/audit-log";

const mockAuditLogs: AuditLog[] = [
	{
		id: "1",
		action: "LOGIN",
		entity: "user",
		entityId: "1",
		adminEmail: "admin@univ.com",
		details: "Connexion réussie",
		timestamp: new Date().toISOString(),
	},
	{
		id: "2",
		action: "CREATE",
		entity: "user",
		entityId: "5",
		adminEmail: "admin@univ.com",
		details: "Création d'un nouvel étudiant",
		timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
	},
];

export const auditLogHandlers = [
	http.get("/api/admin/audit-logs", async () => {
		await delay(500);
		return HttpResponse.json(mockAuditLogs);
	}),
];
