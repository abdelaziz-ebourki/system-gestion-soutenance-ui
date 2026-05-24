import { http, HttpResponse, delay } from "msw";
import { MOCK_DELAY, tblNotifications } from "./db";

export const notificationHandlers = [
  http.get("/api/notifications", async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(tblNotifications);
  }),

  http.patch("/api/notifications/:id/read", async ({ params }) => {
    await delay(MOCK_DELAY);
    const { id } = params;
    const notification = tblNotifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
    return HttpResponse.json({ success: true });
  }),

  http.patch("/api/notifications/read-all", async () => {
    await delay(MOCK_DELAY);
    for (const n of tblNotifications) {
      n.read = true;
    }
    return HttpResponse.json({ success: true });
  }),
];
