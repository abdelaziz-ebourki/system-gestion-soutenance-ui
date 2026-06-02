import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useTeacherStats,
  useTeacherSchedule,
  useTeacherEvaluations,
  useSubmitTeacherEvaluation,
  useTeacherUnavailability,
  useSaveTeacherUnavailability,
} from "@/hooks/use-teacher-queries";
import type { ReactNode } from "react";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useTeacherStats", () => {
  it("returns stats data", async () => {
    const { result } = renderHook(() => useTeacherStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe("useTeacherSchedule", () => {
  it("returns schedule data", async () => {
    const { result } = renderHook(() => useTeacherSchedule(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});

describe("useTeacherEvaluations", () => {
  it("returns evaluations data", async () => {
    const { result } = renderHook(() => useTeacherEvaluations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});

describe("useSubmitTeacherEvaluation", () => {
  it("submits evaluation successfully", async () => {
    const { result } = renderHook(() => useSubmitTeacherEvaluation(), { wrapper: createWrapper() });
    act(() => { result.current.mutate({ id: "1", data: { score: 15, comment: "Good" } }); });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useTeacherUnavailability", () => {
  it("returns unavailability data", async () => {
    const { result } = renderHook(() => useTeacherUnavailability(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe("useSaveTeacherUnavailability", () => {
  it("saves unavailability", async () => {
    const { result } = renderHook(() => useSaveTeacherUnavailability(), { wrapper: createWrapper() });
    act(() => {
      result.current.mutate({
        slotsByDate: { "2026-06-10": ["08:00", "09:00"] },
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
