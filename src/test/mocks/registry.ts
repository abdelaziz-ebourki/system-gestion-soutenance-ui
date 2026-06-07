import { http, HttpResponse } from "msw";
import type { HttpHandler } from "msw";
import { DEFAULT_API_LIMIT } from "@/lib/constants";

function crudId(url: string): string {
  if (url.includes("/config/email")) return "cfg";
  if (url.includes("/config/majors")) return "new-major";
  if (url.includes("/config/levels")) return "new-level";
  if (url.includes("/users")) return "new-id";
  if (url.includes("/rooms")) return "new-room";
  if (url.includes("/departments")) return "new-dept";
  if (url.includes("/projects")) return "new-project";
  if (url.includes("/juries")) return "new-jury";
  if (url.includes("/defense-sessions")) return "new-session";
  if (url.includes("/groups")) return "new-group";
  return "mock-id";
}

export function mockJson(method: "get" | "post" | "put" | "delete" | "patch", url: string, data: unknown): HttpHandler {
  return http[method](url, () => HttpResponse.json(data as never));
}

export function mockPaginated(url: string, items: unknown[], total?: number): HttpHandler[] {
  const actualTotal = total ?? items.length;
  const pageCount = actualTotal > 0 ? Math.ceil(actualTotal / DEFAULT_API_LIMIT) : 1;
  return [
    http.get(url, () =>
      HttpResponse.json({ items, total: actualTotal, pageCount } as never),
    ),
  ];
}

export function mockCrud(baseUrl: string, idPrefix?: string): HttpHandler[] {
  const prefix = idPrefix ?? crudId(baseUrl);
  return [
    http.post(baseUrl, async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json(
        { id: `${prefix}`, ...(body as Record<string, unknown>) } as never,
        { status: 201 },
      );
    }),
    http.put(`${baseUrl}/:id`, async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json(body as never);
    }),
    http.delete(`${baseUrl}/:id`, () => new HttpResponse(null, { status: 204 })),
  ];
}

export function mockEcho(method: "post" | "put" | "patch", url: string): HttpHandler {
  return http[method](url, async ({ request }) => {
    try {
      const body = await request.json();
      return HttpResponse.json(body as never);
    } catch {
      return HttpResponse.json({} as never);
    }
  });
}
