import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { DragEndEvent } from "@dnd-kit/core";
import type { DefenseSession, DefenseSessionStatus, Jury, Room, Project, Teacher } from "@/types";
import type { UnavailabilityEntry } from "@/lib/api-coordinator";
import type { SlotAssignment, ConflictIssue } from "@/lib/conflict-engine";
import { useDefenseSchedule } from "@/hooks/use-defense-schedule";
import * as queries from "@/hooks/queries";
import * as conflictEngine from "@/lib/conflict-engine";
import { toast } from "sonner";
import type { ReactNode } from "react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/queries", () => ({
  useJuries: vi.fn(),
  useRooms: vi.fn(),
  useProjects: vi.fn(),
  useTeachersList: vi.fn(),
  useSaveDefenseSchedule: vi.fn(),
  useCoordinatorDefenseSessions: vi.fn(),
  useCoordinatorUnavailability: vi.fn(),
  useTransitionDefenseSession: vi.fn(),
}));

vi.mock("@/lib/conflict-engine", () => ({
  validateSlotAssignment: vi.fn(),
  buildConflictContext: vi.fn(),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

const mockSessions = [
  {
    id: "s1",
    startDate: "2026-06-01T08:00:00",
    endDate: "2026-06-15T18:00:00",
    startTime: "08:00",
    endTime: "12:00",
    defenseDuration: 60,
    status: "draft",
  },
];

const mockJuries = [
  { id: "j1", projectTitle: "AI in Health", studentNames: ["Alice", "Bob"], projectId: "p1", members: [{ teacherId: "t1", teacherName: "T1", roleName: "President" }] },
  { id: "j2", projectTitle: "Blockchain Logistics", studentNames: ["Charlie", "David"], projectId: "p2", members: [{ teacherId: "t2", teacherName: "T2", roleName: "Member" }] },
];

const mockRooms = [
  { id: "r1", name: "Salle A", capacity: 30 },
  { id: "r2", name: "Salle B", capacity: 20 },
];

const mockUnavailabilities: UnavailabilityEntry[] = [];

const mockSaveMutate = vi.fn().mockResolvedValue({});
const mockTransitionMutate = vi.fn().mockResolvedValue({});

describe("useDefenseSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({ data: mockSessions, isLoading: false } as unknown as UseQueryResult<DefenseSession[], Error>);
    vi.mocked(queries.useJuries).mockReturnValue({ data: mockJuries, isLoading: false } as unknown as UseQueryResult<Jury[], Error>);
    vi.mocked(queries.useRooms).mockReturnValue({ data: mockRooms, isLoading: false } as unknown as UseQueryResult<Room[], Error>);
    vi.mocked(queries.useProjects).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Project[], Error>);
    vi.mocked(queries.useTeachersList).mockReturnValue({ data: [], isLoading: false } as unknown as UseQueryResult<Teacher[], Error>);
    vi.mocked(queries.useCoordinatorUnavailability).mockReturnValue({ data: mockUnavailabilities, isLoading: false } as unknown as UseQueryResult<UnavailabilityEntry[], Error>);
    vi.mocked(queries.useSaveDefenseSchedule).mockReturnValue({ mutateAsync: mockSaveMutate } as unknown as UseMutationResult<void, Error, Record<string, SlotAssignment>>);
    vi.mocked(queries.useTransitionDefenseSession).mockReturnValue({ mutateAsync: mockTransitionMutate } as unknown as UseMutationResult<DefenseSession, Error, { id: string; toStatus: DefenseSessionStatus }>);
    vi.mocked(conflictEngine.validateSlotAssignment).mockReturnValue({ isValid: true, issues: [] });
  });

  it("initializes with the first session selected", () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    expect(result.current.selectedSessionId).toBe("s1");
    expect(result.current.currentSession).toEqual(mockSessions[0]);
  });

  it("computes days window from session start to end (inclusive)", () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    // June 1 to June 15 inclusive = 15 days (was previously a fixed 14-day constant)
    expect(result.current.days).toHaveLength(15);
    expect(result.current.days[0].toISOString()).toContain("2026-06-01");
  });

  it("computes correct time slots based on duration", () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    // 08:00 to 12:00 with 60min duration = 4 slots
    expect(result.current.timeSlots).toEqual(["08:00", "09:00", "10:00", "11:00"]);
  });

  it("computes time slots correctly with different durations", () => {
    vi.mocked(queries.useCoordinatorDefenseSessions).mockReturnValue({
      data: [{
        id: "s2",
        startDate: "2026-06-01T08:00:00",
        endDate: "2026-06-15T18:00:00",
        startTime: "08:00",
        endTime: "12:00",
        defenseDuration: 45,
        status: "draft",
      }],
      isLoading: false,
    } as unknown as UseQueryResult<DefenseSession[], Error>);

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    // 08:00, 08:45, 09:30, 10:15, 11:00, 11:45
    expect(result.current.timeSlots).toEqual(["08:00", "08:45", "09:30", "10:15", "11:00", "11:45"]);
  });

  it("filters juries based on search query", () => {

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSearchQuery("Health"));
    expect(result.current.filteredJuries).toHaveLength(1);
    expect(result.current.filteredJuries[0].id).toBe("j1");

    act(() => result.current.setSearchQuery("Blockchain"));
    expect(result.current.filteredJuries).toHaveLength(1);
    expect(result.current.filteredJuries[0].id).toBe("j2");
  });

  it("handles successful drag end assignment", async () => {
    vi.mocked(conflictEngine.validateSlotAssignment).mockReturnValue({ isValid: true, issues: [] });

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSelectedRoomId("r1"));

    act(() => {
      result.current.handleDragEnd({
        active: { id: "j1" },
        over: { id: "2026-06-01|r1|08:00" },
      } as unknown as DragEndEvent);
    });

    expect(result.current.schedule["j1"]).toEqual({ roomId: "r1", date: "2026-06-01", time: "08:00" });
    expect(toast.success).toHaveBeenCalledWith("Positionné avec succès");
  });

  it("handles conflict during drag end assignment", async () => {
    vi.mocked(conflictEngine.validateSlotAssignment).mockReturnValue({
      isValid: false,
      issues: [{ 
        type: "slot_occupied", 
        severity: "error", 
        message: "Slot already occupied", 
        slot: "2026-06-01|08:00",
        suggestedResolution: "Try room R2"
      }],
    } as { isValid: boolean; issues: ConflictIssue[] });

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSelectedRoomId("r1"));

    act(() => {
      result.current.handleDragEnd({
        active: { id: "j1" },
        over: { id: "2026-06-01|r1|08:00" },
      } as unknown as DragEndEvent);
    });

    expect(result.current.schedule["j1"]).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Slot already occupied Try room R2"),
      expect.any(Object)
    );
  });

  it("handles conflict without suggested resolution", async () => {
    vi.mocked(conflictEngine.validateSlotAssignment).mockReturnValue({
      isValid: false,
      issues: [{ 
        type: "slot_occupied", 
        severity: "error", 
        message: "Critical Error", 
        slot: "2026-06-01|08:00",
      }],
    } as { isValid: boolean; issues: ConflictIssue[] });

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSelectedRoomId("r1"));

    act(() => {
      result.current.handleDragEnd({
        active: { id: "j1" },
        over: { id: "2026-06-01|r1|08:00" },
      } as unknown as DragEndEvent);
    });

    expect(toast.error).toHaveBeenCalledWith("Critical Error");
  });

  it("auto-generates a basic schedule", () => {

    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.handleAutoGenerate());
    
    expect(Object.keys(result.current.schedule)).toHaveLength(2);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Planning généré"));
  });

  it("saves the schedule via API", async () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSelectedRoomId("r1"));
    act(() => {
      result.current.handleDragEnd({
        active: { id: "j1" },
        over: { id: "2026-06-01|r1|08:00" },
      } as unknown as DragEndEvent);
    });

    expect(Object.keys(result.current.schedule)).toHaveLength(1);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockSaveMutate).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Planning enregistré avec succès");
  });

  it("removes a jury from the schedule", () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    act(() => result.current.setSelectedRoomId("r1"));
    act(() => {
      result.current.handleDragEnd({
        active: { id: "j1" },
        over: { id: "2026-06-01|r1|08:00" },
      } as unknown as DragEndEvent);
    });
    
    expect(result.current.schedule["j1"]).toBeDefined();
    
    act(() => {
      result.current.handleRemove("j1");
    });
    
    expect(result.current.schedule["j1"]).toBeUndefined();
  });

  it("handles publish session transition", async () => {
    const { result } = renderHook(() => useDefenseSchedule(), { wrapper: createWrapper() });
    
    await act(async () => {
      await result.current.handlePublish();
    });
    
    expect(mockTransitionMutate).toHaveBeenCalledWith({ id: "s1", toStatus: "active" });
    expect(toast.success).toHaveBeenCalledWith("Session publiée avec succès");
  });
});

