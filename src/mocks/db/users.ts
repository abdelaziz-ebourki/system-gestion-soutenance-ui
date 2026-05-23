import type { DbUser } from "./schema";

export const users: DbUser[] = [
  {
    id: "1", email: "admin@univ.com", password: "1234",
    role: "admin", lastName: "Ahmadi", firstName: "Mohamed", isActive: true,
  },
];
