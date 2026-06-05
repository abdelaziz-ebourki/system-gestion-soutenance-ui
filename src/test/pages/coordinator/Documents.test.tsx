import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { server } from "@/test/mocks/server";
import { http, HttpResponse, delay } from "msw";
import Documents from "@/pages/coordinator/Documents";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.stubGlobal("open", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderDocuments() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Documents />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Documents (Coordinator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    renderDocuments();
    expect(await screen.findByText("Génération de documents")).toBeInTheDocument();
  });

  it("renders all document type cards", async () => {
    renderDocuments();
    expect(await screen.findByText("Fiches d'évaluation")).toBeInTheDocument();
    expect(await screen.findByText("Procès-Verbaux (PV)")).toBeInTheDocument();
    expect(await screen.findByText("Listes de présence")).toBeInTheDocument();
    expect(await screen.findByText("Convocations jury")).toBeInTheDocument();
    expect(await screen.findByText("Planning des soutenances")).toBeInTheDocument();
  });

  it("renders project-grade buttons for evaluation sheets", async () => {
    renderDocuments();
    const buttons = await screen.findAllByText("Application CI/CD");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders jury buttons for convocations with same project title", async () => {
    renderDocuments();
    const buttons = await screen.findAllByText("Application CI/CD");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows generate planning button when sessions exist", async () => {
    renderDocuments();
    expect(await screen.findByText("Générer le planning")).toBeInTheDocument();
  });

  it("shows date picker dialog when attendance list is clicked", async () => {
    const user = userEvent.setup();
    renderDocuments();
    const dateBtn = await screen.findByText("Choisir une date");
    await user.click(dateBtn);
    expect(screen.getByTestId("coord-documents-date-dialog")).toBeInTheDocument();
  });

  it("opens evaluation sheet URL when grade button is clicked", async () => {
    const user = userEvent.setup();
    renderDocuments();
    const gradeBtn = (await screen.findAllByText("Application CI/CD"))[0];
    await user.click(gradeBtn);
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(expect.stringContaining("/print/evaluation-sheet?projectId="), "_blank");
    });
  });

  it("opens schedule URL when generate planning is clicked", async () => {
    const user = userEvent.setup();
    renderDocuments();
    const scheduleBtn = await screen.findByText("Générer le planning");
    await user.click(scheduleBtn);
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(expect.stringContaining("/print/schedule?sessionId="), "_blank");
    });
  });

  it("opens attendance list URL when date is selected and generate is clicked", async () => {
    const user = userEvent.setup();
    renderDocuments();
    const dateBtn = await screen.findByText("Choisir une date");
    await user.click(dateBtn);
    expect(screen.getByTestId("coord-documents-date-dialog")).toBeInTheDocument();
    await user.click(screen.getByTestId("coord-documents-date-generate"));
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(expect.stringContaining("/print/attendance-list?date="), "_blank");
    });
  });

  it("cancels date dialog without generating", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByText("Choisir une date"));
    expect(screen.getByTestId("coord-documents-date-dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("coord-documents-date-dialog")).not.toBeInTheDocument();
    });
  });

  it("opens review dialog and shows loading skeletons", async () => {
    server.use(
      http.get("*/api/coordinator/student-documents", async () => {
        await delay("infinite");
      }),
    );
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    expect(await screen.findByTestId("coord-documents-review-dialog")).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(1);
  });

  it("validates a document successfully", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    await user.click(await screen.findByTestId("coord-doc-approve-d1"));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Document validé");
    });
  });

  it("shows error toast when document validation fails", async () => {
    server.use(
      http.post("*/api/coordinator/student-documents/:id/status", () =>
        HttpResponse.json({ message: "Error" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    await user.click(await screen.findByTestId("coord-doc-approve-d1"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erreur lors de la validation");
    });
  });

  it("rejects a document successfully", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    await user.click(await screen.findByTestId("coord-doc-reject-d1"));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Document refusé");
    });
  });

  it("shows error toast when document rejection fails", async () => {
    server.use(
      http.post("*/api/coordinator/student-documents/:id/status", () =>
        HttpResponse.json({ message: "Error" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    await user.click(await screen.findByTestId("coord-doc-reject-d1"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erreur lors du refus");
    });
  });

  it("shows empty state when no documents to review", async () => {
    server.use(
      http.get("*/api/coordinator/student-documents", () => HttpResponse.json([])),
    );
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    expect(await screen.findByText("Aucun document à réviser.")).toBeInTheDocument();
  });

  it("closes review dialog via Fermer button", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await user.click(await screen.findByTestId("coord-open-review-dialog"));
    expect(await screen.findByTestId("coord-documents-review-dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /fermer/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("coord-documents-review-dialog")).not.toBeInTheDocument();
    });
  });
});
