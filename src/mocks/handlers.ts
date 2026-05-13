import { http, HttpResponse } from "msw";

const mockUsers = [
  {
    id: "1",
    email: "admin@univ.com",
    password: "1234",
    role: "admin",
    name: "Mohamed Ahmadi",
  },
  {
    id: "2",
    email: "coord@univ.com",
    password: "1234",
    role: "coordinator",
    name: "Yassin Ouchen",
  },
  {
    id: "3",
    email: "teacher@univ.com",
    password: "1234",
    role: "teacher",
    name: "Ali Ben Ali",
  },
  {
    id: "4",
    email: "student@univ.com",
    password: "1234",
    role: "student",
    name: "Sami Lalami",
  },
];

export const handlers = [
  http.post("/api/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password?: string;
    };
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return HttpResponse.json({
        user: userWithoutPassword,
        token: `mock-jwt-token-${user.role}`,
      });
    }

    return new HttpResponse(
      JSON.stringify({
        message: "Identifiants invalides (E-mail ou mot de passe incorrect)",
      }),
      { status: 401 },
    );
  }),
];
