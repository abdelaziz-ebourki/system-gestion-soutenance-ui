import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import TeacherSchedule from "@/pages/teacher/TeacherSchedule";
import type { UseQueryResult } from "@tanstack/react-query";
import type { TeacherDefense } from "@/types";

vi.mock("@/hooks/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/queries")>();
  return {
    ...actual,
    useTeacherSchedule: vi.fn(),
  };
});

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
    role: "supervisor",
    status: "scheduled",
  },
  {
    id: "d3",
    projectId: "p3",
    projectTitle: "Gestion de Stocks",
    studentNames: ["Sara"],
    date: "2025-06-15",
    startTime: "14:00",
    endTime: "14:30",
    roomName: "Salle B01",
    role: "examiner",
    status: "completed",
  },
];

function renderSchedule() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeacherSchedule />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TeacherSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    const queries = await import("@/hooks/queries");
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: null, isLoading: true } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    expect(screen.getByTestId("teacher-schedule-header")).toBeInTheDocument();
    expect(screen.getByText("Planning détaillé")).toBeInTheDocument();
  });

  it("renders header and description", async () => {
    const queries = await import("@/hooks/queries");
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    expect(screen.getByTestId("teacher-schedule-header")).toHaveTextContent("Mon planning");
    expect(screen.getByTestId("teacher-schedule-description")).toHaveTextContent("Voici le planning des soutenances auxquelles vous participez.");
  });

  it("calculates and renders stats correctly", async () => {
    const queries = await import("@/hooks/queries");
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    
    // 2 scheduled (d1, d2)
    expect(screen.getByTestId("teacher-schedule-stats-upcoming")).toHaveTextContent("2");
    // 2 jury roles (d1: president, d3: examiner) - d2 is supervisor
    expect(screen.getByTestId("teacher-schedule-stats-jury")).toHaveTextContent("2");
    // 1 supervisor (d2)
    expect(screen.getByTestId("teacher-schedule-stats-supervisor")).toHaveTextContent("1");
  });

  it("renders the data table with items", async () => {
    const queries = await import("@/hooks/queries");
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    
    expect(screen.getAllByText("Application CI/CD").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("IA pour la santé").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Gestion de Stocks").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Salle A01").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Salle B01").length).toBeGreaterThanOrEqual(1);
  });

  it("renders upcoming defense cards", async () => {
    const queries = await import("@/hooks/queries");
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    
    // Only scheduled defenses should have cards (d1, d2)
    expect(screen.getByTestId("teacher-schedule-card-d1")).toBeInTheDocument();
    expect(screen.getByTestId("teacher-schedule-card-d2")).toBeInTheDocument();
    expect(screen.queryByTestId("teacher-schedule-card-d3")).not.toBeInTheDocument();
    
    expect(screen.getAllByText("Ali, Fatima").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Mohammed").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no scheduled defenses", async () => {
    const queries = await import("@/hooks/queries");
    const onlyCompleted: TeacherDefense[] = [
      { ...mockSchedule[2], id: "d3" }
    ];
    vi.mocked(queries.useTeacherSchedule).mockReturnValue({ data: onlyCompleted, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    renderSchedule();
    
    expect(await screen.findByTestId("teacher-schedule-empty")).toHaveTextContent("Aucune soutenance programmée pour la période sélectionnée.");
    expect(screen.queryByTestId("teacher-schedule-card-d1")).not.toBeInTheDocument();
  });
});

