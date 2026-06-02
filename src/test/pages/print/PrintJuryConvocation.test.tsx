import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import PrintJuryConvocation from "@/pages/print/PrintJuryConvocation";
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

describe("PrintJuryConvocation", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("shows missing params error when projectId or teacherId is missing", () => {
    renderWithProviders(<PrintJuryConvocation />, {
      initialEntries: ["/coordinator/print/convocation"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-jury-missing-params")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    server.use(
      http.post("*/api/coordinator/documents/jury-convocations", () => new Promise(() => {})),
    );
    renderWithProviders(<PrintJuryConvocation />, {
      initialEntries: ["/coordinator/print/convocation?projectId=p1&teacherId=Ahmed"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-jury-loading")).toBeInTheDocument();
  });

  it("renders jury convocation on success", async () => {
    renderWithProviders(<PrintJuryConvocation />, {
      initialEntries: ["/coordinator/print/convocation?projectId=p1&teacherId=Ahmed"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-jury-root")).toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.post("*/api/coordinator/documents/jury-convocations", () =>
        HttpResponse.json({ message: "Erreur" }, { status: 500 }),
      ),
    );
    renderWithProviders(<PrintJuryConvocation />, {
      initialEntries: ["/coordinator/print/convocation?projectId=p1&teacherId=Ahmed"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-jury-error")).toBeInTheDocument();
  });

  it("shows not found when convocation does not match teacher", async () => {
    renderWithProviders(<PrintJuryConvocation />, {
      initialEntries: ["/coordinator/print/convocation?projectId=p1&teacherId=ZZZNonexistent"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-jury-not-found")).toBeInTheDocument();
  });
});
