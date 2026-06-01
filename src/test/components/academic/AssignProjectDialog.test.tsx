import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssignProjectDialog } from "@/components/academic/AssignProjectDialog";
import { useProjects, useStudentGroups, useAssignProjectToGroup } from "@/hooks/use-queries";
import { toast } from "sonner";
import type { Project } from "@/types";
import type { StudentGroupAssignment } from "@/lib/api-coordinator";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

vi.mock("@/hooks/use-queries", () => ({
  useProjects: vi.fn(),
  useStudentGroups: vi.fn(),
  useAssignProjectToGroup: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Select to be a simple select for easier testing
vi.mock("@/components/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui")>();
  return {
    ...actual,
    Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (val: string) => void }) => (
      <select 
        data-testid="mock-assign-project-select" 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => children,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  };
});

const mockGroup: StudentGroupAssignment = {
  id: "g1",
  groupName: "Groupe 1",
  memberNames: ["Student A", "Student B"],
  memberCount: 2,
  projectId: null,
};

const mockProjects: Project[] = [
  { id: "p1", title: "Project 1", studentIds: [], supervisorId: "t1", supervisorName: "T1", defenseType: "pfe", status: "approved" },
  { id: "p2", title: "Project 2", studentIds: [], supervisorId: "t1", supervisorName: "T1", defenseType: "pfe", status: "approved" },
];

const mockGroups: StudentGroupAssignment[] = [
  { id: "g2", projectId: "p1", groupName: "Group 2", memberNames: [], memberCount: 0 },
];

describe("AssignProjectDialog", () => {
  const defaultProps = {
    group: mockGroup,
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProjects).mockReturnValue({ data: mockProjects, isLoading: false } as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(useStudentGroups).mockReturnValue({ data: mockGroups, isLoading: false } as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(useAssignProjectToGroup).mockReturnValue({ 
      mutateAsync: vi.fn().mockResolvedValue({}), 
      isPending: false,
    } as unknown as UseMutationResult<Project, Error, { projectId: string; groupId: string }, unknown>);
  });

  it("renders group information", () => {
    render(<AssignProjectDialog {...defaultProps} />);
    expect(screen.getByText("Groupe :")).toBeInTheDocument();
    expect(screen.getByText("Groupe 1")).toBeInTheDocument();
    expect(screen.getByText("Student A, Student B")).toBeInTheDocument();
  });

  it("renders only available projects", () => {
    render(<AssignProjectDialog {...defaultProps} />);
    // p1 is assigned to g2, so only p2 should be available
    expect(screen.queryByText("Project 1")).not.toBeInTheDocument();
    expect(screen.getByText("Project 2")).toBeInTheDocument();
  });

  it("shows empty state when no projects are available", () => {
    vi.mocked(useProjects).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Project[], Error>);
    render(<AssignProjectDialog {...defaultProps} />);
    expect(screen.getByText("Aucun projet disponible. Créez d'abord un projet.")).toBeInTheDocument();
  });

  it("successfully assigns a project", async () => {
    const assignMutation = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
    vi.mocked(useAssignProjectToGroup).mockReturnValue(assignMutation as unknown as UseMutationResult<Project, Error, { projectId: string; groupId: string }, unknown>);

    render(<AssignProjectDialog {...defaultProps} />);
    
    const select = screen.getByTestId("mock-assign-project-select");
    fireEvent.change(select, { target: { value: "p2" } });
    
    const submitBtn = screen.getByTestId("coord-assign-project-submit");
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(assignMutation.mutateAsync).toHaveBeenCalledWith({ 
        projectId: "p2", 
        groupId: "g1" 
      });
      expect(toast.success).toHaveBeenCalledWith('Projet assigné au groupe "Groupe 1"');
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("disables submit button when no project is selected", () => {
    render(<AssignProjectDialog {...defaultProps} />);
    const submitBtn = screen.getByTestId("coord-assign-project-submit");
    expect(submitBtn).toBeDisabled();
  });

  it("handles mutation error", async () => {
    const assignMutation = { mutateAsync: vi.fn().mockRejectedValue(new Error("API Error")), isPending: false };
    vi.mocked(useAssignProjectToGroup).mockReturnValue(assignMutation as unknown as UseMutationResult<Project, Error, { projectId: string; groupId: string }, unknown>);

    render(<AssignProjectDialog {...defaultProps} />);
    
    const select = screen.getByTestId("mock-assign-project-select");
    fireEvent.change(select, { target: { value: "p2" } });
    
    const submitBtn = screen.getByTestId("coord-assign-project-submit");
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(assignMutation.mutateAsync).toHaveBeenCalled();
    });
  });
});
