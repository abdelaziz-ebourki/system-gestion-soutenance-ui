import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import type { UseQueryResult } from "@tanstack/react-query";
import type { TeacherStats, TeacherDefense, TeacherEvaluation } from "@/types";

vi.mock("@/hooks/use-queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-queries")>();
  return {
    ...actual,
    useTeacherStats: vi.fn(),
    useTeacherSchedule: vi.fn(),
    useTeacherEvaluations: vi.fn(),
  };
});

const mockStats: TeacherStats = {
  upcomingDefenses: 2,
  pendingEvaluations: 3,
  declaredUnavailabilitySlots: 5,
  juryAssignments: 1,
};

const mockSchedule: TeacherDefense[] = [
  {
    id: "d1",
    projectId: "p1",
    projectTitle: "Application CI/CD",
    studentNames: ["Ali", "Fatima"],
    date: "2025-06-16",
    startTime: "09:00",
    endTime: "09:30",
    roomName: "Salle A01",
    role: "president",
    status: "scheduled",
  },
  {
    id: "d2",
    projectId: "p2",
    projectTitle: "IA pour la santé",
    studentNames: ["Mohammed"],
    date: "2025-06-16",
    startTime: "10:00",
    endTime: "10:30",
    roomName: "Salle A02",
    role: "examiner",
    status: "scheduled",
  },
];

const mockEvaluations: TeacherEvaluation[] = [
  {
    id: "e1",
    defenseId: "d1",
    projectTitle: "Application CI/CD",
    studentNames: ["Ali", "Fatima"],
    role: "president",
    status: "pending",
  },
  {
    id: "e2",
    defenseId: "d2",
    projectTitle: "IA pour la santé",
    studentNames: ["Mohammed"],
    role: "examiner",
    status: "submitted",
    score: 15,
    comment: "Bon travail",
  },
];

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TeacherDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useTeacherStats).mockReturnValue({ data: null, isLoading: true } as unknown as UseQueryResult<TeacherStats, Error>);
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: [], isLoading: true } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(queries.useTeacherEvaluations).mockReturnValue({ data: [], isLoading: true } as unknown as UseQueryResult<TeacherEvaluation[], Error>);
    renderDashboard();
    expect(screen.getByTestId("teacher-dashboard-stats-upcoming")).toBeInTheDocument();
  });

  it("renders hero section and stat cards", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useTeacherStats).mockReturnValue({ data: mockStats, isLoading: false } as unknown as UseQueryResult<TeacherStats, Error>);
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(queries.useTeacherEvaluations).mockReturnValue({ data: mockEvaluations, isLoading: false } as unknown as UseQueryResult<TeacherEvaluation[], Error>);
    renderDashboard();
    expect(await screen.findByText("Un espace enseignant clair pour suivre jurys, planning et notes.")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1); // upcomingDefenses
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1); // pendingEvaluations
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1); // declaredUnavailabilitySlots
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1); // juryAssignments
  });

  it("renders upcoming defenses list", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useTeacherStats).mockReturnValue({ data: mockStats, isLoading: false } as unknown as UseQueryResult<TeacherStats, Error>);
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(queries.useTeacherEvaluations).mockReturnValue({ data: mockEvaluations, isLoading: false } as unknown as UseQueryResult<TeacherEvaluation[], Error>);
    renderDashboard();
    expect((await screen.findAllByText("Application CI/CD")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IA pour la santé").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Ali, Fatima").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mohammed").length).toBeGreaterThanOrEqual(1);
  });

  it("renders pending evaluations list", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useTeacherStats).mockReturnValue({ data: mockStats, isLoading: false } as unknown as UseQueryResult<TeacherStats, Error>);
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(queries.useTeacherEvaluations).mockReturnValue({ data: mockEvaluations, isLoading: false } as unknown as UseQueryResult<TeacherEvaluation[], Error>);
    renderDashboard();
    expect((await screen.findAllByText("Application CI/CD")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IA pour la santé").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty states when no data", async () => {
    const queries = await import("@/hooks/use-queries");
    vi.mocked(queries.useTeacherStats).mockReturnValue({ data: { ...mockStats, upcomingDefenses: 0, pendingEvaluations: 0 }, isLoading: false } as unknown as UseQueryResult<TeacherStats, Error>);
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(queries.useTeacherEvaluations).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<TeacherEvaluation[], Error>);
    renderDashboard();
    expect(await screen.findByText("Aucune soutenance prévue.")).toBeInTheDocument();
    expect(screen.getByText("Aucune évaluation en attente.")).toBeInTheDocument();
  });
});
