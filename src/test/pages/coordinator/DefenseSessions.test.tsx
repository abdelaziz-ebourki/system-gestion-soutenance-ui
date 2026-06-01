import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import CoordinatorDefenseSessions from "@/pages/coordinator/DefenseSessions";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { DefenseSession, DefenseSessionStatus, JuryRoleTemplate } from "@/types";
import type { CreateDefenseSessionPayload } from "@/lib/api-coordinator";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockSessions = [
  { id: "s1", name: "Session PFE 2025", defenseType: "pfe", status: "draft", maxGroupSize: 3, defenseDuration: 30, breakDuration: 15, submissionDeadline: "2025-06-01", startDate: "2025-06-15", endDate: "2025-06-30", evaluationCoefficients: {}, juryRoleTemplateId: "" },
  { id: "s2", name: "Session Mémoires", defenseType: "memoire", status: "active", maxGroupSize: 2, defenseDuration: 20, breakDuration: 10, submissionDeadline: "2025-05-15", startDate: "2025-06-01", endDate: "2025-06-14", evaluationCoefficients: {}, juryRoleTemplateId: "" },
];

const mockTemplates = [
  { id: "t1", name: "Standard", roles: [{ name: "Président", coefficient: 40 }, { name: "Examinateur", coefficient: 60 }] },
];

vi.mock("@/hooks/use-queries", () => ({
  useCoordinatorDefenseSessions: vi.fn(),
  useTransitionDefenseSession: vi.fn(),
  useCreateDefenseSession: vi.fn(),
  useUpdateDefenseSession: vi.fn(),
  useDeleteDefenseSession: vi.fn(),
  useJuryRoleTemplates: vi.fn(),
}));

function createMutateMock() {
  return {
    isPending: false,
    mutateAsync: vi.fn(),
  };
}

function renderSessions() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CoordinatorDefenseSessions />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DefenseSessions (Coordinator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: [], isLoading: true } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    const { container } = renderSessions();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders empty state when no sessions", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    expect(await screen.findByText("Aucune session de soutenance pour le moment.")).toBeInTheDocument();
  });

  it("renders session cards", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    expect(await screen.findByText("Sessions de soutenance")).toBeInTheDocument();
    expect(screen.getByTestId("coord-sessions-page")).toBeInTheDocument();
    expect(screen.getByText("Session PFE 2025")).toBeInTheDocument();
    expect(screen.getByText("Session Mémoires")).toBeInTheDocument();
  });

  it("renders new session button", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    expect(await screen.findByTestId("coord-sessions-add-button")).toBeInTheDocument();
  });

  it("shows create dialog when add button is clicked", async () => {
    const user = userEvent.setup();
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    const addBtn = await screen.findByTestId("coord-sessions-add-button");
    await user.click(addBtn);
    expect(screen.getByTestId("coord-sessions-dialog")).toBeInTheDocument();
  });

  it("shows status badges for each session", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    expect(await screen.findByText("Brouillon")).toBeInTheDocument();
    const activeElements = screen.getAllByText("Active");
    expect(activeElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders transition buttons for active sessions", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    const transitionButtons = await screen.findAllByText(/Planifiée|Programmée/);
    expect(transitionButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders session details in info boxes", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuryRoleTemplates).mockReturnValue({ data: mockTemplates } as unknown as UseQueryResult<JuryRoleTemplate[], Error>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }, unknown>);
    vi.mocked(queries.useCreateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, CreateDefenseSessionPayload, unknown>);
    vi.mocked(queries.useUpdateDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<DefenseSession, Error, { id: string; data: CreateDefenseSessionPayload }, unknown>);
    vi.mocked(queries.useDeleteDefenseSession).mockReturnValue(createMutateMock() as unknown as UseMutationResult<void, Error, string, unknown>);
    renderSessions();
    expect(await screen.findByText((content) => content.includes("30 min par passage"))).toBeInTheDocument();
    expect(screen.getByText("3 étudiants")).toBeInTheDocument();
  });
});
