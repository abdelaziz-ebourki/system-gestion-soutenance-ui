import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Jurys from "@/pages/coordinator/Jurys";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderJurys() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Jurys />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Jurys (Coordinator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", () => {
    renderJurys();
    expect(screen.getByText("Gestion des Jurys")).toBeInTheDocument();
  });

  it("renders stat cards", async () => {
    renderJurys();
    expect(await screen.findByText("Total Jurys")).toBeInTheDocument();
    expect(await screen.findByText("Projets sans Jury")).toBeInTheDocument();
    expect(await screen.findByText("Vérification")).toBeInTheDocument();
  });

  it("displays juries data from API", async () => {
    renderJurys();
    expect(await screen.findByText("Application CI/CD")).toBeInTheDocument();
    expect(await screen.findByText("Ahmed Benali")).toBeInTheDocument();
  });

  it("shows the add jury button", () => {
    renderJurys();
    expect(screen.getByText("Nouveau Jury")).toBeInTheDocument();
  });

  it("shows delete confirmation when delete is clicked", async () => {
    const user = userEvent.setup();
    renderJurys();
    const deleteBtn = await screen.findByText("Supprimer");
    await user.click(deleteBtn);
    expect(await screen.findByTestId("delete-alert")).toBeInTheDocument();
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });
});
