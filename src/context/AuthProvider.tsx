import { useState, type ReactNode } from "react";
import { AuthContext, type User, type UserRole } from "./auth";

function readSavedUser(): User | null {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const savedUser = window.localStorage.getItem("auth_user");
		if (!savedUser) {
			return null;
		}

		const parsedUser = JSON.parse(savedUser) as Partial<User>;
		if (
			typeof parsedUser.id === "string" &&
			typeof parsedUser.name === "string" &&
			typeof parsedUser.email === "string" &&
			(parsedUser.role === "STUDENT" ||
				parsedUser.role === "TEACHER" ||
				parsedUser.role === "COORDINATOR" ||
				parsedUser.role === "ADMIN")
		) {
			return parsedUser as User;
		}
	} catch (error) {
		console.error("Failed to read auth state:", error);
	}

	return null;
}

function persistUser(user: User | null) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		if (user) {
			window.localStorage.setItem("auth_user", JSON.stringify(user));
		} else {
			window.localStorage.removeItem("auth_user");
		}
	} catch (error) {
		console.error("Failed to persist auth state:", error);
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => readSavedUser());
	const [isLoading] = useState(false);

	const login = (role: UserRole) => {
		const mockUser: User = {
			id: "1",
			name: `Mock ${role.charAt(0) + role.slice(1).toLowerCase()}`,
			email: `${role.toLowerCase()}@example.com`,
			role,
		};

		setUser(mockUser);
		persistUser(mockUser);
	};

	const logout = () => {
		setUser(null);
		persistUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}
