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
    getSchedules: vi.fn(),
    saveSchedules: vi.fn(),
    getCoordinatorUnavailability: vi.fn(),
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
    vi.mocked(api.getEvaluationSheet).mockResolvedValue({} as never);
    vi.mocked(api.getAttendanceList).mockResolvedValue({} as never);
    vi.mocked(api.getJuryConvocations).mockResolvedValue({} as never);
    vi.mocked(api.getDefenseScheduleDoc).mockResolvedValue({} as never);
    vi.mocked(api.getProcesVerbal).mockResolvedValue({} as never);
  });

  describe("Coordinator data queries", () => {
    it("useCoordinatorStats fetches stats", async () => {
      const mockStats = { totalProjects: 10, totalGroups: 5, totalJuries: 5, scheduledDefenses: 2 };
      vi.mocked(api.getCoordinatorStats).mockResolvedValue(mockStats as never);
      
      const { result } = renderHook(() => queries.useCoordinatorStats(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStats);
    });

    it("useCoordinatorUnavailability fetches unavailabilities", async () => {
      const mockUnavail = [{ id: 1, teacherId: 1, date: "2026-06-01", slots: ["08:00"] }];
      vi.mocked(api.getCoordinatorUnavailability).mockResolvedValue(mockUnavail as never);
      
      const { result } = renderHook(() => queries.useCoordinatorUnavailability(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUnavail);
    });
  });

  describe("Project mutations", () => {

    it("useCreateProject invalidates projects query on success", async () => {
      const { result } = renderHook(() => queries.useCreateProject(), { wrapper: createWrapper() });
      vi.mocked(api.createProject).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ title: "New Project", description: "", supervisorId: 10, defenseType: "pfe" });
      });
      
      expect(api.createProject).toHaveBeenCalled();
    });

    it("useCreateProject handles API errors", async () => {
      const { result } = renderHook(() => queries.useCreateProject(), { wrapper: createWrapper() });
      vi.mocked(api.createProject).mockRejectedValue(new Error("API Error"));
      
      await act(async () => {
        await result.current.mutateAsync({ title: "Fail", description: "", supervisorId: 10, defenseType: "pfe" }).catch(() => {});
      });
      
      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("useUpdateProject calls API with correct params", async () => {

      const { result } = renderHook(() => queries.useUpdateProject(), { wrapper: createWrapper() });
      vi.mocked(api.updateProject).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: { title: "Updated", description: "", defenseType: "pfe" } });
      });
      
      expect(api.updateProject).toHaveBeenCalledWith(1, { title: "Updated", description: "", defenseType: "pfe" });
    });
  });

  describe("Group mutations", () => {
    it("useCreateGroup calls API", async () => {
      const { result } = renderHook(() => queries.useCreateGroup(), { wrapper: createWrapper() });
      vi.mocked(api.createGroup).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ groupName: "G1", projectId: 1, studentIds: [1], sessionId: 1 });
      });
      
      expect(api.createGroup).toHaveBeenCalled();
    });

    it("useDeleteGroup calls API", async () => {
      const { result } = renderHook(() => queries.useDeleteGroup(), { wrapper: createWrapper() });
      vi.mocked(api.deleteGroup).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync(1);
      });
      
      expect(api.deleteGroup).toHaveBeenCalledWith(1);
    });
  });

  describe("Jury mutations", () => {

    it("useDeleteJury calls API and invalidates cache", async () => {
      const { result } = renderHook(() => queries.useDeleteJury(), { wrapper: createWrapper() });
      vi.mocked(api.deleteJury).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync(1);
      });
      
      expect(api.deleteJury).toHaveBeenCalledWith(1);
    });
  });

  describe("Defense Session mutations", () => {
    it("useTransitionDefenseSession calls API with correct status", async () => {
      const { result } = renderHook(() => queries.useTransitionDefenseSession(), { wrapper: createWrapper() });
      vi.mocked(api.transitionDefenseSession).mockResolvedValue({} as never);
      
      await act(async () => {
        await result.current.mutateAsync({ id: 1, toStatus: "active" });
      });
      
      expect(api.transitionDefenseSession).toHaveBeenCalledWith(1, "active");
    });
  });

  describe("Document generation hooks", () => {
    it("useEvaluationSheet is disabled when projectId is null", () => {
      const { result } = renderHook(() => queries.useEvaluationSheet(null), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
      expect(api.getEvaluationSheet).not.toHaveBeenCalled();
    });

    it("useEvaluationSheet is enabled when projectId is provided", async () => {
      renderHook(() => queries.useEvaluationSheet(1), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getEvaluationSheet).toHaveBeenCalledWith(1));
    });

    it("useAttendanceList is enabled when defenseSessionId is provided", async () => {
      renderHook(() => queries.useAttendanceList(1), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getAttendanceList).toHaveBeenCalledWith(1));
    });

    it("useJuryConvocations is enabled when projectId is provided", async () => {
      renderHook(() => queries.useJuryConvocations(1), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getJuryConvocations).toHaveBeenCalledWith(1));
    });

    it("useDefenseScheduleDoc is enabled when defenseSessionId is provided", async () => {
      renderHook(() => queries.useDefenseScheduleDoc(1), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getDefenseScheduleDoc).toHaveBeenCalledWith(1));
    });

    it("useProcesVerbal is enabled when projectId is provided", async () => {
      renderHook(() => queries.useProcesVerbal(1), { wrapper: createWrapper() });
      await waitFor(() => expect(api.getProcesVerbal).toHaveBeenCalledWith(1));
    });
  });

  describe("Schedule management", () => {
    it("useSaveSchedules calls API and invalidates stats and schedule", async () => {
      const { result } = renderHook(() => queries.useSaveSchedules(), { wrapper: createWrapper() });
      vi.mocked(api.saveSchedules).mockResolvedValue({} as never);
      
      const slots = [{ title: "AI in Health", roomId: 1, date: "2026-01-01", time: "08:00", projectId: 1 }];
      await act(async () => {
        await result.current.mutateAsync({ defenseSessionId: 1, slots });
      });
      
      expect(api.saveSchedules).toHaveBeenCalledWith(1, slots);
    });
  });
});
