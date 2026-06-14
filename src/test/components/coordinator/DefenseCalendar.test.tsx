import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DefenseCalendar from "@/components/coordinator/DefenseCalendar";
import type { Jury, Room } from "@/types";

vi.mock("@/components/coordinator/DroppableCalendarCell", () => ({
  default: ({ id, jury, onRemove }: { id: string; jury: Jury | null; onRemove: () => void }) => (
    <td data-testid={`mock-cell-${id}`}>
      {jury ? (
        <>
          <span>{jury.projectTitle}</span>
          <button onClick={() => onRemove()} data-testid={`mock-cell-remove-${id}`}>Remove</button>
        </>
      ) : null}
    </td>
  ),
}));

const mockDays = [new Date("2025-06-16"), new Date("2025-06-17")];
const mockTimeSlots = ["09:00-10:00", "10:00-11:00"];
const mockRooms: Room[] = [
  { id: 1, name: "Salle A01", capacity: 30, departmentId: 1 },
  { id: 2, name: "Salle B02", capacity: 20, departmentId: 1 },
];
const mockJuries: Jury[] = [
  { id: 1, projectId: 1, projectTitle: "Project 1", members: [], defenseType: "pfe" },
];
const mockSchedule: Record<string, { roomId: number; date: string; time: string }> = {
  "1": { roomId: 1, date: "2025-06-16", time: "09:00-10:00" },
};

describe("DefenseCalendar", () => {
  const defaultProps = {
    days: mockDays,
    timeSlots: mockTimeSlots,
    schedule: mockSchedule,
    juries: mockJuries,
    onRemove: vi.fn(),
    rooms: mockRooms,
  };

  it("renders a column for each room", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getByTestId("coord-room-column-1")).toBeInTheDocument();
    expect(screen.getByTestId("coord-room-column-2")).toBeInTheDocument();
  });

  it("renders room names", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getByText("Salle A01")).toBeInTheDocument();
    expect(screen.getByText("Salle B02")).toBeInTheDocument();
  });

  it("renders tables for each room", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getByTestId("coord-room-table-1")).toBeInTheDocument();
    expect(screen.getByTestId("coord-room-table-2")).toBeInTheDocument();
  });

  it("renders time slots and day headers", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getAllByText("Heure").length).toBe(2);
    expect(screen.getAllByText("09:00-10:00").length).toBe(2);
    expect(screen.getAllByText("10:00-11:00").length).toBe(2);
  });

  it("correctly maps scheduled juries to room-specific cells", () => {
    render(<DefenseCalendar {...defaultProps} />);

    const cellId = "2025-06-16|1|09:00-10:00";
    expect(screen.getByTestId(`mock-cell-${cellId}`)).toHaveTextContent("Project 1");

    const otherCellId = "2025-06-16|2|09:00-10:00";
    expect(screen.getByTestId(`mock-cell-${otherCellId}`)).not.toHaveTextContent("Project 1");
  });

  it("triggers onRemove when cell remove button is clicked", () => {
    render(<DefenseCalendar {...defaultProps} />);

    const cellId = "2025-06-16|1|09:00-10:00";
    screen.getByTestId(`mock-cell-remove-${cellId}`).click();
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it("renders empty state when no rooms exist", () => {
    render(<DefenseCalendar {...defaultProps} rooms={[]} />);
    expect(screen.getByTestId("coord-calendar-no-room")).toBeInTheDocument();
    expect(screen.getByText("Aucune salle disponible")).toBeInTheDocument();
  });
});
