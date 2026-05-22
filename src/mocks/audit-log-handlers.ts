import { http, HttpResponse, delay } from "msw";
import { MOCK_DELAY, tblAuditLogs, prependAuditLog } from "./db";
import type { AuditLog } from "@/types/audit-log";

export const auditLogHandlers = [
  http.get("/api/admin/audit-logs", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblAuditLogs);
  }),

  http.post("/api/admin/audit-logs", async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = (await request.json()) as Omit<AuditLog, "id" | "timestamp">;
    const entry: AuditLog = {
      ...body,
      id: `al${tblAuditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
    };
    prependAuditLog(entry);
    return HttpResponse.json(entry, { status: 201 });
  }),
];
