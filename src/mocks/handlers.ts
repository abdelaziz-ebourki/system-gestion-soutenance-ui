import { adminHandlers } from "./handlers-admin";
import { coordinatorHandlers } from "./handlers-coordinator";
import { teacherHandlers } from "./handlers-teacher";
import { studentHandlers } from "./handlers-student";

export const handlers = [
  ...adminHandlers,
  ...coordinatorHandlers,
  ...teacherHandlers,
  ...studentHandlers,
];
