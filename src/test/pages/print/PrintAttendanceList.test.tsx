import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import PrintAttendanceList from "@/pages/print/PrintAttendanceList";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

const coordUser = {
  id: 2,
  email: "coord@univh2c.ma",
  firstName: "Coord",
  lastName: "User",
  role: "coordinator" as const,
  isActive: true,
};

describe("PrintAttendanceList", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("shows missing params error when date or sessionId is missing", () => {
    renderWithProviders(<PrintAttendanceList />, {
      initialEntries: ["/coordinator/print/attendance"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-attendance-missing-params")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    server.use(
      http.post("*/api/coordinator/documents/attendance-lists", () => new Promise(() => {})),
    );
    renderWithProviders(<PrintAttendanceList />, {
      initialEntries: ["/coordinator/print/attendance?date=2026-06-15&sessionId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-attendance-loading")).toBeInTheDocument();
  });

  it("renders attendance list on success", async () => {
    renderWithProviders(<PrintAttendanceList />, {
      initialEntries: ["/coordinator/print/attendance?date=2026-06-15&sessionId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-attendance-root")).toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.post("*/api/coordinator/documents/attendance-lists", () =>
        HttpResponse.json({ message: "Erreur" }, { status: 500 }),
      ),
    );
    renderWithProviders(<PrintAttendanceList />, {
      initialEntries: ["/coordinator/print/attendance?date=2026-06-15&sessionId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-attendance-error")).toBeInTheDocument();
  });
});
