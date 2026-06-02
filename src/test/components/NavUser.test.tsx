import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import type { ReactNode } from "react";

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: vi.fn(), theme: "light" }),
}));

vi.mock("@/hooks/use-queries", () => ({
  useUnreadCount: () => 3,
}));

function renderNavUser(ui: ReactNode, options: { token?: string; user?: Record<string, unknown> } = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  if (options.token) localStorage.setItem("token", options.token);
  if (options.user) localStorage.setItem("user", JSON.stringify(options.user));
  localStorage.setItem("expiresAt", String(Date.now() + 7200000));
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <TooltipProvider>
          <SidebarProvider>
            <MemoryRouter>{ui}</MemoryRouter>
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

const mockUser = {
  lastName: "Dupont",
  firstName: "Jean",
  email: "jean@example.com",
  avatar: "https://example.com/avatar.jpg",
};

const authState = { token: "mock", user: { id: "1", email: mockUser.email, role: "admin", lastName: mockUser.lastName, firstName: mockUser.firstName } };

describe("NavUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders user info", () => {
    renderNavUser(<NavUser user={mockUser} />, authState);
    expect(screen.getByText("Dupont Jean")).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("opens dropdown menu on trigger click", async () => {
    const user = userEvent.setup();
    renderNavUser(<NavUser user={mockUser} />, authState);
    await user.click(screen.getByTestId("nav-user-trigger"));
    expect(await screen.findByText("Mon Profil")).toBeInTheDocument();
  });

  it("shows logout confirmation dialog", async () => {
    const user = userEvent.setup();
    renderNavUser(<NavUser user={mockUser} />, authState);
    await user.click(screen.getByTestId("nav-user-trigger"));
    await user.click(await screen.findByTestId("nav-user-logout-trigger"));
    expect(await screen.findByTestId("nav-user-logout-dialog")).toBeInTheDocument();
  });

  it("cancels logout dialog", async () => {
    const user = userEvent.setup();
    renderNavUser(<NavUser user={mockUser} />, authState);
    await user.click(screen.getByTestId("nav-user-trigger"));
    await user.click(await screen.findByTestId("nav-user-logout-trigger"));
    expect(await screen.findByTestId("nav-user-logout-dialog")).toBeInTheDocument();
    await user.click(screen.getByTestId("nav-user-logout-cancel"));
    await waitFor(() => expect(screen.queryByTestId("nav-user-logout-dialog")).not.toBeInTheDocument());
  });
});
