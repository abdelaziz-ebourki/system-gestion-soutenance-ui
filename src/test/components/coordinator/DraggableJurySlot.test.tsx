import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DraggableJurySlot from "@/components/coordinator/DraggableJurySlot";
import { useDraggable } from "@dnd-kit/core";
type UseDraggableReturn = ReturnType<typeof useDraggable>;
import { CSS } from "@dnd-kit/utilities";
import type { Jury } from "@/types";

vi.mock("@dnd-kit/core", () => ({
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  } as unknown as UseDraggableReturn)),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Translate: {
      toString: vi.fn(),
    },
  },
}));

const mockJury: Jury = {
  id: "j1",
  projectId: "p1",
  projectTitle: "Project 1",
  studentNames: ["Student A", "Student B"],
  members: [
    { teacherId: "t1", roleName: "Président", teacherName: "Teacher 1" },
    { teacherId: "t2", roleName: "Examinateur", teacherName: "Teacher 2" },
  ],
  defenseType: "pfe",
  templateId: "temp1",
  templateName: "Standard Jury",
};

describe("DraggableJurySlot", () => {
  it("renders jury information correctly", () => {
    render(<DraggableJurySlot jury={mockJury} />);
    
    expect(screen.getByTestId("coord-jury-slot-j1")).toBeInTheDocument();
    expect(screen.getByTestId("coord-jury-slot-title-j1")).toHaveTextContent("Project 1");
    expect(screen.getByTestId("coord-jury-slot-students-j1")).toHaveTextContent("Student A, Student B");
    expect(screen.getByTestId("coord-jury-slot-member-j1-t1")).toHaveTextContent("Teacher 1");
    expect(screen.getByTestId("coord-jury-slot-member-j1-t2")).toHaveTextContent("Teacher 2");
  });

  it("applies dragging styles when isDragging is true", () => {
    vi.mocked(useDraggable).mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: true,
    } as unknown as UseDraggableReturn);

    render(<DraggableJurySlot jury={mockJury} />);
    const element = screen.getByTestId("coord-jury-slot-j1");
    expect(element.className).toContain("opacity-30");
  });

  it("applies overlay styles and hides grip handle when isOverlay is true", () => {
    render(<DraggableJurySlot jury={mockJury} isOverlay />);
    const element = screen.getByTestId("coord-jury-slot-j1");
    expect(element.className).toContain("shadow-lg");
    expect(element.className).not.toContain("cursor-grab");
    
    // Check that GripVertical is not present
    expect(element.querySelector(".lucide-grip-vertical")).toBeNull();
  });

  it("applies transform style when transform is provided", () => {
    vi.mocked(useDraggable).mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      isDragging: false,
    } as unknown as UseDraggableReturn);

    vi.mocked(CSS.Translate.toString).mockReturnValue("translate3d(10px, 20px, 0)");

    render(<DraggableJurySlot jury={mockJury} />);
    const element = screen.getByTestId("coord-jury-slot-j1");
    expect(element.style.transform).toBe("translate3d(10px, 20px, 0)");
  });
});
