import { createContext, useContext } from "react";

export type UserRole = "STUDENT" | "TEACHER" | "COORDINATOR" | "ADMIN";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export interface AuthContextType {
	user: User | null;
	login: (role: UserRole) => void;
	logout: () => void;
	isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
