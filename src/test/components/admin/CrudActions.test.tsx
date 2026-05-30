import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CrudActions } from "@/components/admin/CrudActions";

describe("CrudActions", () => {
  const entity = { id: "1", name: "Test" };

  it("renders dropdown trigger", () => {
    render(
      <CrudActions entity={entity} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /ouvrir le menu/i })).toBeInTheDocument();
  });

  it("opens menu and fires edit callback", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <CrudActions entity={entity} onEdit={onEdit} onDelete={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    const editItem = screen.getByText("Modifier");
    expect(editItem).toBeInTheDocument();
    await user.click(editItem);
    expect(onEdit).toHaveBeenCalledWith(entity);
  });

  it("opens menu and fires delete callback", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <CrudActions entity={entity} onEdit={vi.fn()} onDelete={onDelete} />,
    );
    await user.click(screen.getByRole("button", { name: /ouvrir le menu/i }));
    const deleteItem = screen.getByText("Supprimer");
    expect(deleteItem).toBeInTheDocument();
    await user.click(deleteItem);
    expect(onDelete).toHaveBeenCalledWith(entity);
  });
});
