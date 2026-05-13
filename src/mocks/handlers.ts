import { http, HttpResponse, delay } from "msw";

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
		name: "Sami El Alami",
	},
];

export const handlers = [
	http.post("/api/login", async ({ request }) => {
		await delay(1000);
		const { email, password } = (await request.json()) as {
			email: string;
			password?: string;
		};
		const user = mockUsers.find(
			(u) => u.email === email && u.password === password,
		);

		if (user) {
			const { password: _, ...userWithoutPassword } = user;
			const expiresIn = 60 * 60 * 1000; // 1 hour
			const expiresAt = Date.now() + expiresIn;

			return HttpResponse.json({
				user: userWithoutPassword,
				token: `mock-jwt-token-${user.role}`,
				expiresAt,
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
