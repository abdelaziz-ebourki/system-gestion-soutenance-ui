import { screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Configuration from "@/pages/admin/Configuration";
import { renderWithProviders } from "@/test/utils";
import { server } from "@/test/mocks/server";

const adminUser = {
  id: 1,
  email: "admin@univh2c.ma",
  firstName: "Admin",
  lastName: "User",
  role: "admin" as const,
  isActive: true,
};

describe("Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  it("renders the configuration page with sections", async () => {
    renderWithProviders(<Configuration />, {
      initialAuthState: { user: adminUser },
    });
    expect(await screen.findByTestId("admin-configuration-page")).toBeInTheDocument();
    expect(screen.getByText("Filières")).toBeInTheDocument();
    expect(screen.getByText("Niveaux")).toBeInTheDocument();
    expect(await screen.findByText("Configuration Email")).toBeInTheDocument();
  });

  it("renders major and level entities", async () => {
    renderWithProviders(<Configuration />, {
      initialAuthState: { user: adminUser },
    });
    expect(await screen.findByText("Génie Informatique")).toBeInTheDocument();
    expect(screen.getByText("L3")).toBeInTheDocument();
  });

  it("renders email config form fields", async () => {
    renderWithProviders(<Configuration />, {
      initialAuthState: { user: adminUser },
    });
    expect(await screen.findByDisplayValue("smtp.example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("587")).toBeInTheDocument();
  });
});
