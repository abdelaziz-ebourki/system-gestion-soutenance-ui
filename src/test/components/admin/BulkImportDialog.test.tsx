import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
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

const fileDataMap = new Map<string, ArrayBuffer>();

beforeAll(() => {
  const RealFile = globalThis.File;

  vi.stubGlobal(
    "File",
    vi.fn(function MockFile(
      bits: BlobPart[],
      name: string,
      options?: FilePropertyBag,
    ) {
      for (const bit of bits) {
        if (bit instanceof ArrayBuffer) {
          fileDataMap.set(name, bit);
        }
      }
      return new RealFile(bits, name, options);
    }) as unknown as typeof File,
  );

  vi.stubGlobal(
    "FileReader",
    vi.fn().mockImplementation(function () {
      let _onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
      return {
        get onload() {
          return _onload;
        },
        set onload(fn) {
          _onload = fn;
        },
        result: null as ArrayBuffer | string | null,
        readAsArrayBuffer(file: File) {
          const data = fileDataMap.get(file.name);
          if (data) {
            this.result = data;
            const event = new ProgressEvent("load");
            Object.defineProperty(event, "target", {
              value: { result: data },
              configurable: true,
            });
            _onload?.call(
              this as unknown as FileReader,
              event as ProgressEvent<FileReader>,
            );
          }
        },
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      };
    }),
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

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
  afterEach(() => fileDataMap.clear());

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
    await user.upload(fileInput, badFile);

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

    await user.upload(fileInput, validData);

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
    await user.upload(fileInput, validData);
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
    await user.upload(fileInput, validData);
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
    await user.upload(fileInput, validData);
    await screen.findByText(/1 enregistrements trouvés/i);
    await user.click(screen.getByRole("button", { name: /importer/i }));
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
