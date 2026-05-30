import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { STORAGE_KEYS } from "@/lib/constants";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderWithAuth(initialEntries: string[] = ["/admin"]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<div data-testid="admin-content">Admin</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders child route when authenticated with correct role", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "valid-token");
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "1",
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
      }),
    );
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() + 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("admin-content")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  it("redirects to login when not authenticated", async () => {
    renderWithAuth();

    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });

  it("shows expired session toast when wasExpired is true", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "expired-token");
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "1",
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
      }),
    );
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() - 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      "Votre session a expiré. Veuillez vous reconnecter.",
    );
  });

  it("redirects to login when role is not allowed", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "valid-token");
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "2",
        email: "student@test.com",
        firstName: "Student",
        lastName: "User",
        role: "student",
        isActive: true,
      }),
    );
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() + 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
  });
});
