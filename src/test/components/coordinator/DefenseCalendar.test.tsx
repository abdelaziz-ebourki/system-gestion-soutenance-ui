import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DefenseCalendar from "@/components/coordinator/DefenseCalendar";
import type { Jury, Room } from "@/types";

vi.mock("@/components/coordinator/RoomSearchSelect", () => ({
  RoomSearchSelect: ({ onChange, value }: { onChange: (val: string | null) => void; value: string | null }) => (
    <select 
      data-testid="mock-room-select" 
      value={value || ""} 
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Sélectionnez une salle</option>
      <option value="1">Salle A01</option>
    </select>
  ),
}));

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
const mockRooms: Room[] = [{ id: 1, name: "Salle A01", capacity: 30, departmentId: 1 }];
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
    selectedRoomId: null as number | null,
    onRemove: vi.fn(),
    rooms: mockRooms,
    onRoomChange: vi.fn(),
  };

  it("renders RoomSearchSelect", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getByTestId("mock-room-select")).toBeInTheDocument();
  });

  it("renders empty state when no room is selected", () => {
    render(<DefenseCalendar {...defaultProps} />);
    expect(screen.getByTestId("coord-calendar-no-room")).toBeInTheDocument();
    expect(screen.getByText("Veuillez sélectionner une salle pour afficher le planning")).toBeInTheDocument();
  });

  it("renders table when room is selected", () => {
    render(<DefenseCalendar {...defaultProps} selectedRoomId={1} />);
    expect(screen.getByTestId("coord-calendar-table")).toBeInTheDocument();
    expect(screen.getByText("Heure")).toBeInTheDocument();
    
    expect(screen.getByText(/lundi/i)).toBeInTheDocument();
    expect(screen.getByText(/mardi/i)).toBeInTheDocument();
  });

  it("correctly maps scheduled juries to cells", () => {
    render(<DefenseCalendar {...defaultProps} selectedRoomId={1} />);
    
    const cellId = "2025-06-16|09:00-10:00";
    expect(screen.getByTestId(`mock-cell-${cellId}`)).toHaveTextContent("Project 1");
  });

  it("triggers onRemove when cell remove button is clicked", () => {
    render(<DefenseCalendar {...defaultProps} selectedRoomId={1} />);
    
    const cellId = "2025-06-16|09:00-10:00";
    fireEvent.click(screen.getByTestId(`mock-cell-remove-${cellId}`));
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it("triggers onRoomChange when room selection changes", () => {
    render(<DefenseCalendar {...defaultProps} />);
    const select = screen.getByTestId("mock-room-select");
    fireEvent.change(select, { target: { value: "1" } });
    expect(defaultProps.onRoomChange).toHaveBeenCalled();
  });
});
