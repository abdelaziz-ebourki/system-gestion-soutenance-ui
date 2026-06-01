import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DefenseCalendar from "@/components/coordinator/DefenseCalendar";
import type { Jury, Room } from "@/types";

vi.mock("@/components/coordinator/RoomSearchSelect", () => ({
  RoomSearchSelect: ({ onChange, value }: { onChange: (val: string) => void; value: string | null }) => (
    <select 
      data-testid="mock-room-select" 
      value={value || ""} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Sélectionnez une salle</option>
      <option value="r1">Salle A01</option>
    </select>
  ),
}));

vi.mock("@/components/coordinator/DroppableCalendarCell", () => ({
  default: ({ id, jury, onRemove }: { id: string; jury: Jury | null; onRemove: (id: string) => void }) => (
    <td data-testid={`mock-cell-${id}`}>
      {jury ? (
        <>
          <span>{jury.projectTitle}</span>
           <button onClick={() => onRemove(id)} data-testid={`mock-cell-remove-${id}`}>Remove</button>
        </>
      ) : null}
    </td>
  ),
}));

const mockDays = [new Date("2025-06-16"), new Date("2025-06-17")];
const mockTimeSlots = ["09:00-10:00", "10:00-11:00"];
const mockRooms: Room[] = [{ id: "r1", name: "Salle A01", capacity: 30, departmentId: "d1" }];
const mockJuries: Jury[] = [
  { id: "j1", projectId: "p1", projectTitle: "Project 1", studentNames: ["S1"], members: [], defenseType: "pfe", templateId: "t1", templateName: "Standard" },
];
const mockSchedule = {
  "j1": { roomId: "r1", date: "2025-06-16", time: "09:00-10:00" },
};

describe("DefenseCalendar", () => {
  const defaultProps = {
    days: mockDays,
    timeSlots: mockTimeSlots,
    schedule: mockSchedule,
    juries: mockJuries,
    selectedRoomId: null,
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
    render(<DefenseCalendar {...defaultProps} selectedRoomId="r1" />);
    expect(screen.getByTestId("coord-calendar-table")).toBeInTheDocument();
    expect(screen.getByText("Heure")).toBeInTheDocument();
    
    // Check dates in headers
    expect(screen.getByText(/lundi/i)).toBeInTheDocument(); // 2025-06-16 is Monday
    expect(screen.getByText(/mardi/i)).toBeInTheDocument(); // 2025-06-17 is Tuesday
  });

  it("correctly maps scheduled juries to cells", () => {
    render(<DefenseCalendar {...defaultProps} selectedRoomId="r1" />);
    
    // j1 is at 2025-06-16, 09:00-10:00
    const cellId = "2025-06-16|09:00-10:00";
    expect(screen.getByTestId(`mock-cell-${cellId}`)).toHaveTextContent("Project 1");
  });

  it("triggers onRemove when cell remove button is clicked", () => {
    render(<DefenseCalendar {...defaultProps} selectedRoomId="r1" />);
    
    const cellId = "2025-06-16|09:00-10:00";
    fireEvent.click(screen.getByTestId(`mock-cell-remove-${cellId}`));
    expect(defaultProps.onRemove).toHaveBeenCalledWith("j1");
  });

  it("triggers onRoomChange when room selection changes", () => {
    render(<DefenseCalendar {...defaultProps} />);
    const select = screen.getByTestId("mock-room-select");
    fireEvent.change(select, { target: { value: "r1" } });
    expect(defaultProps.onRoomChange).toHaveBeenCalledWith("r1");
  });
});
