import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { GraduationCap } from "lucide-react";
import { ConfigCard } from "@/components/admin/config/ConfigCard";

const items = [
  { id: "1", name: "Génie Informatique" },
  { id: "2", name: "Génie Civil" },
];

describe("ConfigCard", () => {
  it("renders items list", () => {
    render(
      <ConfigCard
        title="Filières"
        description="Gérer les filières"
        icon={<GraduationCap />}
        items={items}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Filières")).toBeInTheDocument();
    expect(screen.getByText("Génie Informatique")).toBeInTheDocument();
    expect(screen.getByText("Génie Civil")).toBeInTheDocument();
  });

  it("shows empty message when no items", () => {
    render(
      <ConfigCard
        title="Filières"
        description="Gérer les filières"
        icon={<GraduationCap />}
        items={[]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Aucun élément configuré.")).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfigCard
        title="Filières"
        description="Gérer les filières"
        icon={<GraduationCap />}
        items={items}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /ajouter/i }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("calls onEdit when edit button is clicked on an item", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfigCard
        title="Filières"
        description="Gérer les filières"
        icon={<GraduationCap />}
        items={items}
        onAdd={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: "" });
    await user.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(items[0]);
  });
});
