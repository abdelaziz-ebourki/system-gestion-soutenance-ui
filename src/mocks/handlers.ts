import { http, HttpResponse } from "msw";

export const handlers = [
	http.post("/api/login", async ({ request }) => {
		const { email } = await request.json();

		if (email === "admin@univ.com") {
			return HttpResponse.json({
				user: { id: "1", email: "admin@univ.com", role: "admin" },
				token: "mock-jwt-token",
			});
		}

		return new HttpResponse(
			JSON.stringify({ message: "Invalid credentials" }),
			{ status: 401 },
		);
	}),
];
