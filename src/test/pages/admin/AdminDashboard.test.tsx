import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "@/pages/admin/AdminDashboard";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", () => {
    renderDashboard();
    expect(screen.getByText("Tableau de Bord")).toBeInTheDocument();
  });

  it("renders stat cards with values from API", async () => {
    renderDashboard();
    expect(await screen.findByText("100")).toBeInTheDocument();
    expect(await screen.findByText("20")).toBeInTheDocument();
    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(await screen.findByText("15")).toBeInTheDocument();
  });

  it("renders the users table with data from API", async () => {
    renderDashboard();
    const adminEmails = await screen.findAllByText("admin@univh2c.ma");
    expect(adminEmails.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("teacher@univh2c.ma")).toBeInTheDocument();
  });

  it("renders audit logs section", async () => {
    renderDashboard();
    expect(await screen.findByText("Journal d'audit")).toBeInTheDocument();
    expect(await screen.findByText("Connexion admin")).toBeInTheDocument();
  });

  it("renders active sessions and upcoming defenses", async () => {
    renderDashboard();
    expect(await screen.findByText(/3 Sessions Actives/)).toBeInTheDocument();
    expect(await screen.findByText(/8 Soutenances/)).toBeInTheDocument();
  });
});
