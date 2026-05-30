import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BatchActionsBar } from "@/components/admin/BatchActionsBar";

function renderBatch(overrideProps = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const defaultProps = {
    selectedCount: 0,
    entityLabel: "étudiant(s)",
    actions: [{ key: "major", label: "Modifier la filière" }, { key: "delete", label: "Supprimer" }],
    fieldOptionsMap: {
      major: [{ value: "m1", label: "Génie Info" }, { value: "m2", label: "Génie Civil" }],
    },
    onUpdateField: vi.fn(),
    onDeleteSelected: vi.fn(),
    isPending: false,
    onClearSelection: vi.fn(),
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <BatchActionsBar {...defaultProps} {...overrideProps} />
    </QueryClientProvider>,
  );
}

describe("BatchActionsBar", () => {
  it("does not render when selectedCount is 0", () => {
    const { container } = renderBatch({ selectedCount: 0 });
    expect(container.firstChild).toBeNull();
  });

  it("renders with selected count", () => {
    renderBatch({ selectedCount: 3 });
    expect(screen.getByText(/3 étudiant\(s\) sélectionné\(s\)/)).toBeInTheDocument();
  });

  it("opens delete alert when delete action is clicked", async () => {
    const user = userEvent.setup();
    renderBatch({ selectedCount: 2 });
    await user.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(screen.getByText(/Confirmation/)).toBeInTheDocument();
  });

  it("calls onDeleteSelected when delete is confirmed", async () => {
    const onDeleteSelected = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderBatch({ selectedCount: 2, onDeleteSelected });
    await user.click(screen.getByRole("button", { name: /supprimer/i }));
    await user.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(onDeleteSelected).toHaveBeenCalled();
  });
});
