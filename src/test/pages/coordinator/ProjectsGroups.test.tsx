import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import CoordinatorProjects from "@/pages/coordinator/ProjectsGroups";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { Project, Student, Teacher } from "@/types";
import type { StudentGroupAssignment, UpdateProjectPayload } from "@/lib/api-coordinator";
import type { PaginatedResponse } from "@/lib/api-core";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/academic/ProjectDialog", () => ({
  ProjectDialog: ({ open }: { open: boolean }) => open ? <div data-testid="mock-project-dialog" /> : null,
}));

vi.mock("@/components/academic/AssignProjectDialog", () => ({
  AssignProjectDialog: ({ open }: { open: boolean }) => open ? <div data-testid="mock-assign-dialog" /> : null,
}));

function createMockQueryData() {
  return {
    projects: {
      data: [
        { id: "p1", title: "Application CI/CD", description: "CI/CD pipeline", studentIds: ["s1", "s2"], studentNames: ["Ali", "Fatima"], supervisorId: "t1", supervisorName: "Dr. Alami", status: "approved" as const },
        { id: "p2", title: "IA pour la santé", description: "ML diagnostics", studentIds: ["s3"], studentNames: ["Mohammed"], supervisorId: "t2", supervisorName: "Pr. Bennani", status: "pending" as const },
      ],
      isLoading: false,
    },
    studentGroups: {
      data: [
        { id: "g1", groupName: "Groupe A", memberNames: ["Ali", "Fatima"], projectId: "p1", projectTitle: "Application CI/CD" },
        { id: "g2", groupName: "Groupe B", memberNames: ["Mohammed"], projectId: null, projectTitle: null },
      ],
      isLoading: false,
    },
    updateProject: { isPending: false, mutateAsync: vi.fn() },
    deleteProject: { isPending: false, mutateAsync: vi.fn() },
  };
}

vi.mock("@/hooks/use-queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-queries")>();
  return {
    ...actual,
    useProjects: vi.fn(() => ({ data: [], isLoading: false })),
    useUpdateProject: vi.fn(() => ({ isPending: false, mutateAsync: vi.fn() })),
    useDeleteProject: vi.fn(() => ({ isPending: false, mutateAsync: vi.fn() })),
    useStudentGroups: vi.fn(() => ({ data: [], isLoading: false })),
    useTeachersList: vi.fn(() => ({ data: [], isLoading: false })),
    useCreateProject: vi.fn(() => ({ isPending: false, mutateAsync: vi.fn() })),
    useStudents: vi.fn(() => ({ data: { items: [] }, isLoading: false })),
  };
});

function renderProjects() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CoordinatorProjects />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProjectsGroups (Coordinator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title and header", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    expect(await screen.findByText("Projets & Groupes")).toBeInTheDocument();
    expect(screen.getByTestId("coord-projects-page")).toBeInTheDocument();
  });

  it("renders stats cards", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("Portefeuille")).toBeInTheDocument();
    expect(screen.getByText("A valider")).toBeInTheDocument();
  });

  it("renders the add project button", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    expect(await screen.findByTestId("coord-projects-add-button")).toBeInTheDocument();
  });

  it("renders project table with data", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    const projectTitles = await screen.findAllByText(/Application CI\/CD|IA pour la santé/);
    expect(projectTitles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Valide")).toBeInTheDocument();
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("renders student groups section with assigned and unassigned groups", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    expect(await screen.findByText("Groupes étudiants")).toBeInTheDocument();
    expect(screen.getByText("Groupe A")).toBeInTheDocument();
    expect(screen.getByText("Groupe B")).toBeInTheDocument();
    expect(screen.getByTestId("coord-projects-groups-section")).toBeInTheDocument();
  });

  it("renders assign button for unassigned groups", async () => {
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    expect(await screen.findByTestId("coord-projects-assign-g2")).toBeInTheDocument();
  });

  it("shows project dialog when add button is clicked", async () => {
    const user = userEvent.setup();
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue(data.deleteProject as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    const addBtn = await screen.findByTestId("coord-projects-add-button");
    await user.click(addBtn);
    expect(screen.getByTestId("mock-project-dialog")).toBeInTheDocument();
  });

  it("shows loading skeleton when projects are loading", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useProjects).mockReturnValue({ data: [], isLoading: true } as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue({ isPending: false, mutateAsync: vi.fn() } as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue({ isPending: false, mutateAsync: vi.fn() } as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    renderProjects();
    expect(screen.getByTestId("coord-projects-page")).toBeInTheDocument();
    const skeleton = document.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("shows empty project portfolio", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useProjects).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue({ isPending: false, mutateAsync: vi.fn() } as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue({ isPending: false, mutateAsync: vi.fn() } as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    renderProjects();
    expect(await screen.findByTestId("coord-projects-page")).toBeInTheDocument();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it("calls delete mutation when CrudActions delete is confirmed", async () => {
    const user = userEvent.setup();
    const queries = await import("@/hooks/use-queries");
    const data = createMockQueryData();
    const deleteMutate = vi.fn();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useUpdateProject).mockReturnValue(data.updateProject as unknown as UseMutationResult<Project, Error, { id: string; data: UpdateProjectPayload }, unknown>);
    vi.mocked(queries.useDeleteProject).mockReturnValue({ isPending: false, mutateAsync: deleteMutate } as unknown as UseMutationResult<void, Error, string, unknown>);
    vi.mocked(queries.useStudentGroups).mockReturnValue(data.studentGroups as unknown as UseQueryResult<StudentGroupAssignment[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useStudents).mockReturnValue({ data: { items: [], total: 0, pageCount: 0 }, isLoading: false } as unknown as UseQueryResult<PaginatedResponse<Student>, Error>);
    renderProjects();
    const triggers = await screen.findAllByTestId("crud-actions-trigger");
    await user.click(triggers[0]);
    await user.click(screen.getByRole("menuitem", { name: /supprimer/i }));
    expect(await screen.findByTestId("delete-alert")).toBeInTheDocument();
    await user.click(screen.getByTestId("delete-alert-confirm"));
    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith("p1");
    });
  });
});
