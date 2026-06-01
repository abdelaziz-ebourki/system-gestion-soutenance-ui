import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoomSearchSelect } from "@/components/coordinator/RoomSearchSelect";
import type { Room } from "@/types";

vi.mock("@/components/ui", () => ({
  SimpleSelect: ({ label, options, value, onChange }: { label: string; options: Array<{ label: string; value: string }>; value: string | null; onChange: (val: string) => void }) => (
    <div>
      <label>{label}</label>
      <select 
        data-testid="mock-simple-select" 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  ),
}));

const mockRooms: Room[] = [
  { id: "r1", name: "Salle A01", capacity: 30, departmentId: "d1" },
  { id: "r2", name: "Salle B02", capacity: 20, departmentId: "d1" },
];

describe("RoomSearchSelect", () => {
  it("renders correctly with label", () => {
    render(<RoomSearchSelect rooms={mockRooms} value={null} onChange={vi.fn()} />);
    expect(screen.getByText("Salle")).toBeInTheDocument();
  });

  it("formats options correctly", () => {
    render(<RoomSearchSelect rooms={mockRooms} value={null} onChange={vi.fn()} />);
    expect(screen.getByText("Salle A01 (30 places)")).toBeInTheDocument();
    expect(screen.getByText("Salle B02 (20 places)")).toBeInTheDocument();
  });

  it("triggers onChange when selection changes", () => {
    const onChange = vi.fn();
    render(<RoomSearchSelect rooms={mockRooms} value={null} onChange={onChange} />);
    const select = screen.getByTestId("mock-simple-select");
    fireEvent.change(select, { target: { value: "r1" } });
    expect(onChange).toHaveBeenCalledWith("r1");
  });
});
