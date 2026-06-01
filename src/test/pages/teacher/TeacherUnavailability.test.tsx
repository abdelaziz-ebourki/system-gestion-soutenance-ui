import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import TeacherUnavailability from "@/pages/teacher/TeacherUnavailability";
import { useTeacherSchedule, useTeacherUnavailability, useSaveTeacherUnavailability } from "@/hooks/use-queries";
import type { TeacherUnavailability as UnavailabilityType, TeacherDefense } from "@/types";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { AvailabilityCalendarProps } from "@/components/academic/AvailabilityCalendar";

vi.mock("@/hooks/use-queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/use-queries")>();
  return {
    ...actual,
    useTeacherSchedule: vi.fn(),
    useTeacherUnavailability: vi.fn(),
    useSaveTeacherUnavailability: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    toastError: vi.fn(),
  };
});

vi.mock("@/components/academic/AvailabilityCalendar", () => ({
  default: ({ onToggleSlot }: AvailabilityCalendarProps) => (
    <div data-testid="availability-calendar">
      <button 
        onClick={() => onToggleSlot("2025-06-16", "09:00-10:00")} 
        data-testid="calendar-toggle-slot"
      >
        Toggle Slot
      </button>
    </div>
  ),
}));

const mockSchedule = [
  {
    id: "d1",
    projectId: "p1",
    projectTitle: "Project 1",
    studentNames: ["Student 1"],
    date: "2025-06-16",
    startTime: "09:00",
    endTime: "10:00",
    roomName: "Room 1",
    role: "president",
    status: "scheduled",
  } as TeacherDefense,
];

const mockUnavailability: UnavailabilityType = {
  slotsByDate: {
    "2025-06-17": ["08:00-09:00", "09:00-10:00"],
    "2025-06-18": ["10:00-11:00"],
  },
};

const mockSaveMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
} as unknown as UseMutationResult<UnavailabilityType, Error, UnavailabilityType, unknown>;

function renderUnavailability() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeacherUnavailability />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TeacherUnavailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: null, isLoading: true } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: null, isLoading: true } as unknown as UseQueryResult<UnavailabilityType, Error>);
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(mockSaveMutation);
    
    renderUnavailability();
    expect(screen.getByTestId("teacher-unavailability-header")).toBeInTheDocument();
    expect(screen.queryByTestId("availability-calendar")).not.toBeInTheDocument();
  });

  it("renders header and save button", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: mockUnavailability, isLoading: false } as unknown as UseQueryResult<UnavailabilityType, Error>);
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(mockSaveMutation);
    
    renderUnavailability();
    expect(screen.getByTestId("teacher-unavailability-header")).toHaveTextContent("Mes indisponibilités");
    expect(screen.getByTestId("teacher-unavailability-description")).toBeInTheDocument();
    expect(screen.getByTestId("teacher-unavailability-save")).toBeInTheDocument();
  });

  it("calculates and renders stats correctly", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: mockUnavailability, isLoading: false } as unknown as UseQueryResult<UnavailabilityType, Error>);
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(mockSaveMutation);
    
    renderUnavailability();
    
    // 2 slots on 17th, 1 slot on 18th = 3 total
    expect(screen.getByTestId("teacher-unavailability-stats-blocked")).toHaveTextContent("3");
    // 2 days
    expect(screen.getByTestId("teacher-unavailability-stats-days")).toHaveTextContent("2");
  });

  it("renders AvailabilityCalendar and handles slot toggle", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: mockUnavailability, isLoading: false } as unknown as UseQueryResult<UnavailabilityType, Error>);
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(mockSaveMutation);
    
    renderUnavailability();
    
    expect(screen.getByTestId("availability-calendar")).toBeInTheDocument();
    
    const toggleBtn = screen.getByTestId("calendar-toggle-slot");
    fireEvent.click(toggleBtn);
    
    // After toggle, we save and check if it was updated in state. 
    // Since we don't have a way to check internal state, we check the mutation call on save.
    fireEvent.click(screen.getByTestId("teacher-unavailability-save"));
    
    expect(mockSaveMutation.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      slotsByDate: expect.objectContaining({
        "2025-06-16": ["09:00-10:00"]
      })
    }));
  });

  it("saves unavailability and shows success toast", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: mockUnavailability, isLoading: false } as unknown as UseQueryResult<UnavailabilityType, Error>);
    
    const saveMutation = {
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    } as unknown as UseMutationResult<UnavailabilityType, Error, UnavailabilityType, unknown>;
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(saveMutation);
    
    const { toast } = await import("sonner");
    
    renderUnavailability();
    
    fireEvent.click(screen.getByTestId("teacher-unavailability-save"));
    
    await waitFor(() => {
      expect(saveMutation.mutateAsync).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Indisponibilités enregistrées");
    });
  });

  it("shows error toast when save fails", async () => {
    vi.mocked(useTeacherSchedule).mockReturnValue({ data: mockSchedule, isLoading: false } as unknown as UseQueryResult<TeacherDefense[], Error>);
    vi.mocked(useTeacherUnavailability).mockReturnValue({ data: mockUnavailability, isLoading: false } as unknown as UseQueryResult<UnavailabilityType, Error>);
    
    const saveMutation = {
      mutateAsync: vi.fn().mockRejectedValue(new Error("API Error")),
      isPending: false,
    } as unknown as UseMutationResult<UnavailabilityType, Error, UnavailabilityType, unknown>;
    vi.mocked(useSaveTeacherUnavailability).mockReturnValue(saveMutation);
    
    const { toastError } = await import("@/lib/utils");
    
    renderUnavailability();
    
    fireEvent.click(screen.getByTestId("teacher-unavailability-save"));
    
    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
  });
});
