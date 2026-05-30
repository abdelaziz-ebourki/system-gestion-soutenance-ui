import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DeleteAlert } from "@/components/admin/DeleteAlert";

describe("DeleteAlert", () => {
  it("renders with entity name", () => {
    render(
      <DeleteAlert
        isOpen
        onOpenChange={vi.fn()}
        onDelete={vi.fn()}
        entityName="Salle 101"
        isPending={false}
      />,
    );
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
    expect(screen.getByText(/Salle 101/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /supprimer/i })).toBeInTheDocument();
  });

  it("calls onDelete when confirm is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteAlert
        isOpen
        onOpenChange={vi.fn()}
        onDelete={onDelete}
        entityName="Test"
        isPending={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /supprimer/i }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("does not call onDelete when cancel is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteAlert
        isOpen
        onOpenChange={vi.fn()}
        onDelete={onDelete}
        entityName="Test"
        isPending={false}
      />,
    );
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("renders with custom title", () => {
    render(
      <DeleteAlert
        isOpen
        onOpenChange={vi.fn()}
        onDelete={vi.fn()}
        title="Supprimer l'élément"
        entityName="Test"
        isPending={false}
      />,
    );
    expect(screen.getByText("Supprimer l'élément")).toBeInTheDocument();
  });
});
