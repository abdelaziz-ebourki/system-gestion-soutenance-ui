import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmailConfigForm } from "@/components/admin/config/EmailConfigForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EmailConfigForm />
    </QueryClientProvider>,
  );
}

describe("EmailConfigForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads email config from API and populates form", async () => {
    renderForm();
    expect(await screen.findByDisplayValue("smtp.example.com")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("587")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Université")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("noreply@example.com")).toBeInTheDocument();
  });

  it("submits form and shows success toast", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    renderForm();

    const hostInput = await screen.findByDisplayValue("smtp.example.com");
    await user.clear(hostInput);
    await user.type(hostInput, "mail.example.com");

    await user.click(screen.getByRole("button", { name: /sauvegarder/i }));

    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Configuration email mise à jour");
    });
  });

  it("renders the card title and description", async () => {
    renderForm();
    expect(await screen.findByText("Configuration Email")).toBeInTheDocument();
  });

  it("has a Sauvegarder button", async () => {
    renderForm();
    expect(await screen.findByRole("button", { name: /sauvegarder/i })).toBeInTheDocument();
  });
});
