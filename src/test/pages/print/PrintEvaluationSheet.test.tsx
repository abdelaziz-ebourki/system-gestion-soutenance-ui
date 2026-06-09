import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import PrintEvaluationSheet from "@/pages/print/PrintEvaluationSheet";
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

describe("PrintEvaluationSheet", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("shows loading state", () => {
    server.use(
      http.post("*/api/coordinator/documents/evaluation-sheets", () => new Promise(() => {})),
    );
    renderWithProviders(<PrintEvaluationSheet />, {
      initialEntries: ["/coordinator/print/evaluation?projectId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(screen.getByTestId("print-evaluation-loading")).toBeInTheDocument();
  });

  it("renders evaluation sheet on success", async () => {
    renderWithProviders(<PrintEvaluationSheet />, {
      initialEntries: ["/coordinator/print/evaluation?projectId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-evaluation-root")).toBeInTheDocument();
  });

  it("shows error on API failure", async () => {
    server.use(
      http.post("*/api/coordinator/documents/evaluation-sheets", () =>
        HttpResponse.json({ message: "Erreur" }, { status: 500 }),
      ),
    );
    renderWithProviders(<PrintEvaluationSheet />, {
      initialEntries: ["/coordinator/print/evaluation?projectId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-evaluation-error")).toBeInTheDocument();
  });

  it("shows empty state when no grade data", async () => {
    server.use(
      http.post("*/api/coordinator/documents/evaluation-sheets", () =>
        HttpResponse.json([]),
      ),
    );
    renderWithProviders(<PrintEvaluationSheet />, {
      initialEntries: ["/coordinator/print/evaluation?projectId=1"],
      initialAuthState: { user: coordUser },
    });
    expect(await screen.findByTestId("print-evaluation-empty")).toBeInTheDocument();
  });
});
