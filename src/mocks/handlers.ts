import { adminHandlers } from "./handlers-admin";
import { coordinatorHandlers } from "./handlers-coordinator";
import { teacherHandlers } from "./handlers-teacher";
import { studentHandlers } from "./handlers-student";
import { notificationHandlers } from "./handlers-notifications";

export const handlers = [
  ...adminHandlers,
  ...coordinatorHandlers,
  ...teacherHandlers,
  ...studentHandlers,
  ...notificationHandlers,
];
