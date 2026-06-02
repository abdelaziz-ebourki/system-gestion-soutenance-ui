import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StudentDocuments from "@/pages/student/StudentDocuments";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

const studentUser = {
  id: "4",
  email: "student@univh2c.ma",
  firstName: "Student",
  lastName: "User",
  role: "student" as const,
  isActive: true,
};

describe("StudentDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  it("renders document list with status badges", async () => {
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    expect(await screen.findByText("Rapport PFE")).toBeInTheDocument();
    expect(screen.getByText("Déposé")).toBeInTheDocument();
    expect(screen.getByText("Validé")).toBeInTheDocument();
    expect(screen.getByText("Manquant")).toBeInTheDocument();
    expect(screen.getByText("Refusé")).toBeInTheDocument();
  });

  it("renders stats cards", async () => {
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    expect(await screen.findByTestId("student-documents-stats-total")).toBeInTheDocument();
    expect(screen.getByTestId("student-documents-stats-validated")).toBeInTheDocument();
    expect(screen.getByTestId("student-documents-stats-missing")).toBeInTheDocument();
  });

  it("shows upload controls only for missing documents", async () => {
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    expect(await screen.findByTestId("student-documents-file-input-d2")).toBeInTheDocument();
    expect(screen.queryByTestId("student-documents-file-input-d1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("student-documents-file-input-d3")).not.toBeInTheDocument();
  });

  it("uploads a document successfully", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    const fileInput = await screen.findByTestId("student-documents-file-input-d2");
    const file = new File(["dummy content"], "fiche.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    await user.click(screen.getByTestId("student-documents-upload-btn-d2"));
    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Document envoyé avec succès");
    });
  });

  it("shows error when uploading without selecting a file", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    const uploadBtn = await screen.findByTestId("student-documents-upload-btn-d2");
    await user.click(uploadBtn);
    expect(toast.error).toHaveBeenCalledWith("Veuillez sélectionner un fichier.");
  });

  it("shows empty state when no documents", async () => {
    server.use(
      http.get("*/api/student/documents", () => HttpResponse.json([])),
    );
    renderWithProviders(<StudentDocuments />, {
      initialAuthState: { user: studentUser },
    });
    expect(await screen.findByText("Aucun document trouvé.")).toBeInTheDocument();
  });
});
