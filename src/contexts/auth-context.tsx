import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { UserRole } from "@/types";

interface User {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
}

function isValidUser(data: unknown): data is User {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    (typeof obj.id === "string" || typeof obj.id === "number") &&
    typeof obj.firstName === "string" &&
    typeof obj.lastName === "string" &&
    typeof obj.email === "string" &&
    ["admin", "coordinator", "teacher", "student"].includes(obj.role as string)
  );
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  wasExpired: boolean;
  login: (user: User) => void;
  logout: () => void;
  clearExpired: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wasExpired, setWasExpired] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (isValidUser(parsed)) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (newUser: User) => {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const clearExpired = useCallback(() => {
    setWasExpired(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setWasExpired(true);
      logout();
      window.location.href = "/login";
    };

    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        wasExpired,
        login,
        logout,
        clearExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
