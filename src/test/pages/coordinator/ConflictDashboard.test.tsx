import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import ConflictDashboard from "@/pages/coordinator/ConflictDashboard";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Project, Room, Jury, Group, DefenseSession, Teacher } from "@/types";
import type { UnavailabilityEntry, ScheduleResponse } from "@/lib/api-coordinator";

vi.mock("@/lib/conflict-engine", () => ({
  getAllConflicts: vi.fn(),
  buildConflictContext: vi.fn(() => ({
    schedule: {},
    rooms: {},
    groups: {},
    projects: {},
    teachers: {},
    juries: {},
    unavailability: {},
  })),
}));

function createMockQueryData() {
  return {
    projects: {
      data: [{ id: 1, title: "Application CI/CD", description: "", defenseType: "pfe", groupId: 1, supervisorName: "Supervisor", studentNames: ["Ali", "Fatima"] }],
      isLoading: false,
    },
    rooms: {
      data: { items: [{ id: 1, name: "Salle A01", capacity: 30, departmentId: 1 }], total: 1, pageCount: 1, currentPage: 0, size: 10 },
      isLoading: false,
    },
    juries: {
      data: [{ id: 1, projectId: 1, projectTitle: "Application CI/CD", defenseType: "pfe", members: [{ teacherId: 1, teacherName: "Dr. Alami", roleName: "Président" }, { teacherId: 2, teacherName: "Pr. Bennani", roleName: "Examinateur" }] }],
      isLoading: false,
    },
    groups: {
      data: [{ id: 1, groupName: "Groupe A", projectId: 1, memberCount: 2, studentNames: ["Ali", "Fatima"] }],
      isLoading: false,
    },
    sessions: {
      data: [{ id: 1, name: "Session PFE 2025", defenseType: "pfe", status: "draft", maxGroupSize: 3, defenseDuration: 30, breakDuration: 15, submissionDeadline: "2025-06-01", evaluationCoefficients: {}, juryRoleTemplateId: 1, startDate: "2025-06-15", endDate: "2025-06-30" }],
      isLoading: false,
    },
    schedules: {
      data: [] as ScheduleResponse[],
      isLoading: false,
    },
    unavailability: {
      data: [],
      isLoading: false,
    },
  };
}

vi.mock("@/hooks/queries", () => ({
  useProjects: vi.fn(),
  useRooms: vi.fn(),
  useJuries: vi.fn(),
  useGroups: vi.fn(),
  useCoordinatorDefenseSessions: vi.fn(),
  useSchedules: vi.fn(),
  useCoordinatorUnavailability: vi.fn(),
  useTeachersList: vi.fn(),
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ConflictDashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ConflictDashboard (Coordinator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton", async () => {
    const { getAllConflicts } = await import("@/lib/conflict-engine");
    vi.mocked(getAllConflicts).mockReturnValue([]);
    const queries = await import("@/hooks/queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue({ ...data.projects, isLoading: true } as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useRooms).mockReturnValue(data.rooms as unknown as UseQueryResult<{ items: Room[]; total: number; pageCount: number; currentPage: number; size: number }, Error>);
    vi.mocked(queries.useJuries).mockReturnValue(data.juries as unknown as UseQueryResult<Jury[], Error>);
    vi.mocked(queries.useGroups).mockReturnValue(data.groups as unknown as UseQueryResult<Group[], Error>);
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue(data.sessions as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useSchedules).mockReturnValue(data.schedules as unknown as UseQueryResult<ScheduleResponse[], Error>);
    vi.mocked(queries.useCoordinatorUnavailability).mockReturnValue(data.unavailability as unknown as UseQueryResult<UnavailabilityEntry[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    const { container } = renderDashboard();
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

    it("renders page title and stats cards", async () => {
    const { getAllConflicts } = await import("@/lib/conflict-engine");
    vi.mocked(getAllConflicts).mockReturnValue([
      { type: "teacher_double_booked", severity: "error", message: "Conflit enseignant", suggestedResolution: "Déplacer", slot: "s1" },
      { type: "room_capacity", severity: "warning", message: "Capacité insuffisante", suggestedResolution: "Changer de salle", slot: "s1" },
    ]);
    const queries = await import("@/hooks/queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useRooms).mockReturnValue(data.rooms as unknown as UseQueryResult<{ items: Room[]; total: number; pageCount: number; currentPage: number; size: number }, Error>);
    vi.mocked(queries.useJuries).mockReturnValue(data.juries as unknown as UseQueryResult<Jury[], Error>);
    vi.mocked(queries.useGroups).mockReturnValue(data.groups as unknown as UseQueryResult<Group[], Error>);
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue(data.sessions as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useSchedules).mockReturnValue(data.schedules as unknown as UseQueryResult<ScheduleResponse[], Error>);
    vi.mocked(queries.useCoordinatorUnavailability).mockReturnValue(data.unavailability as unknown as UseQueryResult<UnavailabilityEntry[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    renderDashboard();
    expect(await screen.findByText("Conflits de planification")).toBeInTheDocument();
    expect(screen.getByTestId("coord-conflicts-page")).toBeInTheDocument();
    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(1);
    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no conflicts", async () => {
    const { getAllConflicts } = await import("@/lib/conflict-engine");
    vi.mocked(getAllConflicts).mockReturnValue([]);
    const queries = await import("@/hooks/queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useRooms).mockReturnValue(data.rooms as unknown as UseQueryResult<{ items: Room[]; total: number; pageCount: number; currentPage: number; size: number }, Error>);
    vi.mocked(queries.useJuries).mockReturnValue(data.juries as unknown as UseQueryResult<Jury[], Error>);
    vi.mocked(queries.useGroups).mockReturnValue(data.groups as unknown as UseQueryResult<Group[], Error>);
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue(data.sessions as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useSchedules).mockReturnValue(data.schedules as unknown as UseQueryResult<ScheduleResponse[], Error>);
    vi.mocked(queries.useCoordinatorUnavailability).mockReturnValue(data.unavailability as unknown as UseQueryResult<UnavailabilityEntry[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    renderDashboard();
    expect(await screen.findByText("Aucun conflit détecté. La planification est prête à être publiée.")).toBeInTheDocument();
  });

    it("renders grouped conflict cards", async () => {
    const { getAllConflicts } = await import("@/lib/conflict-engine");
    vi.mocked(getAllConflicts).mockReturnValue([
      { type: "teacher_double_booked", severity: "error", message: "Enseignant Dr. Alami doublonné", suggestedResolution: "Déplacer un passage", slot: "s1" },
      { type: "room_capacity", severity: "warning", message: "Salle A01 trop petite", suggestedResolution: "Utiliser la salle B02", slot: "s1" },
    ]);
    const queries = await import("@/hooks/queries");
    const data = createMockQueryData();
    vi.mocked(queries.useProjects).mockReturnValue(data.projects as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useRooms).mockReturnValue(data.rooms as unknown as UseQueryResult<{ items: Room[]; total: number; pageCount: number; currentPage: number; size: number }, Error>);
    vi.mocked(queries.useJuries).mockReturnValue(data.juries as unknown as UseQueryResult<Jury[], Error>);
    vi.mocked(queries.useGroups).mockReturnValue(data.groups as unknown as UseQueryResult<Group[], Error>);
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue(data.sessions as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useSchedules).mockReturnValue(data.schedules as unknown as UseQueryResult<ScheduleResponse[], Error>);
    vi.mocked(queries.useCoordinatorUnavailability).mockReturnValue(data.unavailability as unknown as UseQueryResult<UnavailabilityEntry[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    renderDashboard();
    expect(await screen.findByText("Conflit enseignant")).toBeInTheDocument();
    expect(screen.getByText("Capacité de salle")).toBeInTheDocument();
    expect(screen.getByText("Enseignant Dr. Alami doublonné")).toBeInTheDocument();
    expect(screen.getByText("Salle A01 trop petite")).toBeInTheDocument();
    expect(screen.getByText(/Suggestion : Déplacer un passage/)).toBeInTheDocument();
    expect(screen.getByText(/Suggestion : Utiliser la salle B02/)).toBeInTheDocument();
  });
});

