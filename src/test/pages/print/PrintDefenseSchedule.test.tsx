import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import PrintDefenseSchedule from "@/pages/print/PrintDefenseSchedule";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

const coordUser = {
  id: "2",
  email: "coord@univh2c.ma",
  firstName: "Coord",
  lastName: "User",
  role: "coordinator" as const,
  isActive: true,
};

describe("PrintDefenseSchedule", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("shows loading state", () => {
    server.use(
      http.post("*/api/coordinator/documents/schedule", () => new Promise(() => {})),
    );
    renderWithProviders(<PrintDefenseSchedule />, {
      initialEntries: ["/coordinator/print/schedule?sessionId=ds1"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-schedule-loading")).toBeInTheDocument();
  });

  it("renders defense schedule on success", async () => {
    renderWithProviders(<PrintDefenseSchedule />, {
      initialEntries: ["/coordinator/print/schedule?sessionId=ds1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-schedule-root")).toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.post("*/api/coordinator/documents/schedule", () =>
        HttpResponse.json({ message: "Erreur" }, { status: 500 }),
      ),
    );
    renderWithProviders(<PrintDefenseSchedule />, {
      initialEntries: ["/coordinator/print/schedule?sessionId=ds1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-schedule-error")).toBeInTheDocument();
  });
});
