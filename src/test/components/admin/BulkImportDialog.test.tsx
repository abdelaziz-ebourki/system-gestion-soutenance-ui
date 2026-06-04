import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import * as XLSX from "xlsx";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api", () => ({
  bulkCreateUsers: vi.fn().mockResolvedValue(undefined),
  bulkCreateRooms: vi.fn().mockResolvedValue(undefined),
}));

function renderBulk(props = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BulkImportDialog entity="student" {...props} />
    </QueryClientProvider>,
  );
}

function createMockFile(data: Record<string, string>[]): File {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbBuf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new File([wbBuf], "import.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

describe("BulkImportDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders trigger button", () => {
    renderBulk();
    expect(screen.getByRole("button", { name: /importation en masse/i })).toBeInTheDocument();
  });

  it("shows dialog on trigger click", async () => {
    const user = userEvent.setup();
    renderBulk();
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));
    expect(screen.getByText(/Téléchargez un fichier Excel/i)).toBeInTheDocument();
  });

  it("shows error for missing required columns", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    renderBulk();
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));

    await screen.findByText(/Téléchargez un fichier Excel/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const badFile = createMockFile([{ name: "Test" }]);
    await act(async () => {
      await user.upload(fileInput, badFile);
    });

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("shows records found when valid file is uploaded", async () => {
    const user = userEvent.setup();
    renderBulk();
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));

    await screen.findByText(/Téléchargez un fichier Excel/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validData = createMockFile([
      { prénom: "Jean", nom: "Dupont", email: "jean@test.com", cne: "CNE001", major: "Génie Info", niveau: "L3" },
    ]);

    await act(async () => {
      await user.upload(fileInput, validData);
    });

    expect(await screen.findByText(/1 enregistrements trouvés/i)).toBeInTheDocument();
  });

  it("imports students on submit", async () => {
    const { bulkCreateUsers } = await import("@/lib/api");
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    renderBulk();
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));
    await screen.findByText(/Téléchargez un fichier Excel/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validData = createMockFile([
      { prénom: "Jean", nom: "Dupont", email: "jean@test.com", cne: "CNE001", major: "Génie Info", niveau: "L3" },
    ]);
    await act(async () => {
      await user.upload(fileInput, validData);
    });
    await screen.findByText(/1 enregistrements trouvés/i);
    await user.click(screen.getByRole("button", { name: /importer/i }));
    await vi.waitFor(() => {
      expect(bulkCreateUsers).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("calls onSuccess after successful import", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderBulk({ onSuccess });
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));
    await screen.findByText(/Téléchargez un fichier Excel/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validData = createMockFile([
      { prénom: "Jean", nom: "Dupont", email: "jean@test.com", cne: "CNE001", major: "Génie Info", niveau: "L3" },
    ]);
    await act(async () => {
      await user.upload(fileInput, validData);
    });
    await screen.findByText(/1 enregistrements trouvés/i);
    await user.click(screen.getByRole("button", { name: /importer/i }));
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("shows error toast when import fails", async () => {
    const { bulkCreateUsers } = await import("@/lib/api");
    (bulkCreateUsers as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("import failed"));
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    renderBulk();
    await user.click(screen.getByRole("button", { name: /importation en masse/i }));
    await screen.findByText(/Téléchargez un fichier Excel/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validData = createMockFile([
      { prénom: "Jean", nom: "Dupont", email: "jean@test.com", cne: "CNE001", major: "Génie Info", niveau: "L3" },
    ]);
    await act(async () => {
      await user.upload(fileInput, validData);
    });
    await screen.findByText(/1 enregistrements trouvés/i);
    await user.click(screen.getByRole("button", { name: /importer/i }));
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
