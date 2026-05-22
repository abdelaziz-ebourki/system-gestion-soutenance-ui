import { http, HttpResponse, delay } from "msw";
import { MOCK_DELAY } from "./db";
import { notifications } from "./db/notifications";

export const notificationHandlers = [
  http.get("/api/notifications", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(notifications);
  }),

  http.patch("/api/notifications/:id/read", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return HttpResponse.json({ success: true });
  }),

  http.patch("/api/notifications/read-all", async () => {
    await delay(MOCK_DELAY);
    for (const n of notifications) {
      n.read = true;
    }
    return HttpResponse.json({ success: true });
  }),
];
