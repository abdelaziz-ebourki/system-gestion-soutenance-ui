import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import PrintProcesVerbal from "@/pages/print/PrintProcesVerbal";
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

describe("PrintProcesVerbal", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("shows loading state", () => {
    server.use(
      http.post("*/api/coordinator/documents/proces-verbal", () => new Promise(() => {})),
    );
    renderWithProviders(<PrintProcesVerbal />, {
      initialEntries: ["/coordinator/print/pv?projectId=p1"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-pv-loading")).toBeInTheDocument();
  });

  it("renders proces verbal on success", async () => {
    renderWithProviders(<PrintProcesVerbal />, {
      initialEntries: ["/coordinator/print/pv?projectId=p1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-pv-root")).toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.post("*/api/coordinator/documents/proces-verbal", () =>
        HttpResponse.json({ message: "Erreur" }, { status: 500 }),
      ),
    );
    renderWithProviders(<PrintProcesVerbal />, {
      initialEntries: ["/coordinator/print/pv?projectId=p1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-pv-error")).toBeInTheDocument();
  });

  it("shows empty state when no grade data", async () => {
    server.use(
      http.post("*/api/coordinator/documents/proces-verbal", () =>
        HttpResponse.json({
          settings: { institutionName: "Test" },
          grade: null,
          studentNames: [],
          supervisorName: "",
          juryMembers: [],
        }),
      ),
    );
    renderWithProviders(<PrintProcesVerbal />, {
      initialEntries: ["/coordinator/print/pv?projectId=p1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-pv-empty")).toBeInTheDocument();
  });
});
