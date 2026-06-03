import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as queries from "@/hooks/use-coordinator-queries";
import * as api from "@/lib/api";
import type { ReactNode } from "react";

vi.mock("@/lib/api", () => {
  const mocks = {
    getCoordinatorStats: vi.fn(),
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    getJuries: vi.fn(),
    createJury: vi.fn(),
    updateJury: vi.fn(),
    deleteJury: vi.fn(),
    getGroups: vi.fn(),
    createGroup: vi.fn(),
    deleteGroup: vi.fn(),
    getCoordinatorDefenseSessions: vi.fn(),
    createCoordinatorDefenseSession: vi.fn(),
    updateCoordinatorDefenseSession: vi.fn(),
    deleteCoordinatorDefenseSession: vi.fn(),
    transitionDefenseSession: vi.fn(),
    getDefenseSchedule: vi.fn(),
    saveDefenseSchedule: vi.fn(),
    getCoordinatorUnavailability: vi.fn(),
    getStudentGroups: vi.fn(),
    getGrades: vi.fn(),
    assignProjectToGroup: vi.fn(),
    getEvaluationSheet: vi.fn(),
    getAttendanceList: vi.fn(),
    getJuryConvocations: vi.fn(),
    getDefenseScheduleDoc: vi.fn(),
    getProcesVerbal: vi.fn(),
  };
  return { ...mocks };
});

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useCoordinatorQueries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Project mutations", () => {
    it("useCreateProject invalidates projects query on success", async () => {
      const { result } = renderHook(() => queries.useCreateProject(), { wrapper: createWrapper() });
      vi.mocked(api.createProject).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ title: "New Project", supervisorId: "s1" });
      });
      
      expect(api.createProject).toHaveBeenCalled();
    });

    it("useUpdateProject calls API with correct params", async () => {
      const { result } = renderHook(() => queries.useUpdateProject(), { wrapper: createWrapper() });
      vi.mocked(api.updateProject).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ id: "p1", data: { title: "Updated" } });
      });
      
      expect(api.updateProject).toHaveBeenCalledWith("p1", { title: "Updated" });
    });
  });

  describe("Jury mutations", () => {
    it("useDeleteJury calls API and invalidates cache", async () => {
      const { result } = renderHook(() => queries.useDeleteJury(), { wrapper: createWrapper() });
      vi.mocked(api.deleteJury).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync("j1");
      });
      
      expect(api.deleteJury).toHaveBeenCalledWith("j1");
    });
  });

  describe("Defense Session mutations", () => {
    it("useTransitionDefenseSession calls API with correct status", async () => {
      const { result } = renderHook(() => queries.useTransitionDefenseSession(), { wrapper: createWrapper() });
      vi.mocked(api.transitionDefenseSession).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ id: "s1", toStatus: "active" });
      });
      
      expect(api.transitionDefenseSession).toHaveBeenCalledWith("s1", "active");
    });
  });

  describe("Document generation hooks", () => {
    it("useEvaluationSheet is disabled when projectId is null", () => {
      const { result } = renderHook(() => queries.useEvaluationSheet(null), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
      expect(api.getEvaluationSheet).not.toHaveBeenCalled();
    });

    it("useEvaluationSheet is enabled when projectId is provided", async () => {
      renderHook(() => queries.useEvaluationSheet("p1"), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getEvaluationSheet).toHaveBeenCalledWith("p1"));
    });

    it("useAttendanceList is enabled when defenseSessionId is provided", async () => {
      renderHook(() => queries.useAttendanceList("s1"), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getAttendanceList).toHaveBeenCalledWith("s1"));
    });

    it("useJuryConvocations is enabled when projectId is provided", async () => {
      renderHook(() => queries.useJuryConvocations("p1"), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getJuryConvocations).toHaveBeenCalledWith("p1"));
    });

    it("useDefenseScheduleDoc is enabled when defenseSessionId is provided", async () => {
      renderHook(() => queries.useDefenseScheduleDoc("s1"), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getDefenseScheduleDoc).toHaveBeenCalledWith("s1"));
    });

    it("useProcesVerbal is enabled when projectId is provided", async () => {
      renderHook(() => queries.useProcesVerbal("p1"), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getProcesVerbal).toHaveBeenCalledWith("p1"));
    });
  });

  describe("Schedule management", () => {
    it("useSaveDefenseSchedule calls API and invalidates stats and schedule", async () => {
      const { result } = renderHook(() => queries.useSaveDefenseSchedule(), { wrapper: createWrapper() });
      vi.mocked(api.saveDefenseSchedule).mockResolvedValue({} as never);
      
      const schedule = { "j1": { id: "j1", title: "AI in Health", roomId: "r1", date: "2026-01-01", time: "08:00" } };
      await act(async () => {
        await result.current.mutateAsync(schedule);
      });
      
      expect(api.saveDefenseSchedule).toHaveBeenCalledWith(schedule);
    });
  });
});
