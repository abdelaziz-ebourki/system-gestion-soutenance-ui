import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { ProjectList } from "@/components/coordinator/ProjectList";
import type { Project } from "@/types";

type UseDraggableReturn = ReturnType<typeof useDraggable>;

vi.mock(import("@dnd-kit/core"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      isDragging: false,
    }) as unknown as UseDraggableReturn,
  };
});

const mockProjects: Project[] = [
  { id: "p1", title: "Project Alpha", studentNames: ["Alice"], supervisorName: "Dr. X", status: "approved", studentIds: ["s1"], supervisorId: "t1", defenseType: "pfe" },
  { id: "p2", title: "Project Beta", studentNames: ["Bob", "Carol"], supervisorName: "Dr. Y", status: "approved", studentIds: ["s2", "s3"], supervisorId: "t2", defenseType: "pfe" },
];

describe("ProjectList", () => {
  it("renders all projects", () => {
    render(
      <DndContext>
        <ProjectList projects={mockProjects} assignedProjectIds={new Set()} mode="click" selectedProjectId={null} onSelect={() => {}} />
      </DndContext>
    );
    expect(screen.getByTestId("coord-project-card-p1")).toBeInTheDocument();
    expect(screen.getByTestId("coord-project-card-p2")).toBeInTheDocument();
  });

  it("calls onSelect when clicking unassigned project in click mode", () => {
    const onSelect = vi.fn();
    render(
      <DndContext>
        <ProjectList projects={mockProjects} assignedProjectIds={new Set()} mode="click" selectedProjectId={null} onSelect={onSelect} />
      </DndContext>
    );
    fireEvent.click(screen.getByTestId("coord-project-card-p1"));
    expect(onSelect).toHaveBeenCalledWith("p1");
  });

  it("highlights selected project", () => {
    render(
      <DndContext>
        <ProjectList projects={mockProjects} assignedProjectIds={new Set()} mode="click" selectedProjectId="p1" onSelect={() => {}} />
      </DndContext>
    );
    const card = screen.getByTestId("coord-project-card-p1");
    expect(card.className).toContain("border-primary");
  });

  it("shows assigned projects with opacity", () => {
    render(
      <DndContext>
        <ProjectList projects={mockProjects} assignedProjectIds={new Set(["p1"])} mode="click" selectedProjectId={null} onSelect={() => {}} />
      </DndContext>
    );
    const card = screen.getByTestId("coord-project-card-p1");
    expect(card.className).toContain("opacity-50");
  });

  it("renders project title and student names", () => {
    render(
      <DndContext>
        <ProjectList projects={mockProjects} assignedProjectIds={new Set()} mode="click" selectedProjectId={null} onSelect={() => {}} />
      </DndContext>
    );
    expect(screen.getByTestId("coord-project-title-p1")).toHaveTextContent("Project Alpha");
    expect(screen.getByTestId("coord-project-students-p1")).toHaveTextContent("Alice");
  });
});
