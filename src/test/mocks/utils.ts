import { http, HttpResponse } from "msw";
import { server } from "./server";

interface MockErrorOptions {
  status?: number;
  body?: Record<string, unknown>;
}

export function mockError(
  url: string,
  options?: MockErrorOptions,
) {
  const { status = 500, body = { message: "Erreur serveur" } } = options ?? {};
  server.use(
    http.all(url, () => HttpResponse.json(body, { status })),
  );
}
