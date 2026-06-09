import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";
import { ConfigEntityManager } from "@/components/admin/config/ConfigEntityManager";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createMockMut<TVariables>(): UseMutationResult<unknown, Error, TVariables, unknown> {
  return {
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  } as unknown as UseMutationResult<unknown, Error, TVariables, unknown>;
}

function renderManager(overrideProps: Record<string, unknown> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const defaultProps = {
    title: "Filières",
    description: "Gérer les filières",
    icon: <GraduationCap />,
    entityLabel: "Filière",
    entityLabelPlural: "Filières",
    data: [
      { id: 1, name: "Génie Informatique" },
      { id: 2, name: "Génie Civil" },
    ],
    createMut: createMockMut<{ name: string }>(),
    updateMut: createMockMut<{ id: number; data: { name: string } }>(),
    deleteMut: createMockMut<number>(),
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfigEntityManager {...defaultProps} {...overrideProps} />
    </QueryClientProvider>,
  );
}

describe("ConfigEntityManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with data", () => {
    renderManager();
    expect(screen.getByText("Génie Informatique")).toBeInTheDocument();
    expect(screen.getByText("Génie Civil")).toBeInTheDocument();
  });

  it("opens create dialog when add button is clicked", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    expect(screen.getByText(/Ajouter Filière/i)).toBeInTheDocument();
  });

  it("submits create form", async () => {
    const createMut = createMockMut();
    const user = userEvent.setup();
    renderManager({ createMut });
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Nouvelle Filière");
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(createMut.mutateAsync).toHaveBeenCalledWith({ name: "Nouvelle Filière" });
  });

  it("opens delete confirmation", async () => {
    const user = userEvent.setup();
    renderManager();
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    await user.click(deleteButtons[deleteButtons.length - 1]);
    expect(screen.getByText(/Confirmation/)).toBeInTheDocument();
  });
});
