import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Profile from "@/pages/Profile";
import { renderWithProviders } from "@/test/utils";

describe("Profile", () => {
  it("renders loading skeleton when no user", () => {
    renderWithProviders(<Profile />);
    expect(screen.getByTestId("profile-skeleton")).toBeInTheDocument();
  });

  it("renders user profile when authenticated", async () => {
    renderWithProviders(<Profile />, {
      initialAuthState: {
        user: {
          id: 1,
          email: "admin@univh2c.ma",
          firstName: "Admin",
          lastName: "User",
          role: "admin" as const,
          isActive: true,
        },
      },
    });
    expect(await screen.findByTestId("profile-header")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@univh2c.ma")).toBeInTheDocument();
  });

  it("resolves role label correctly", async () => {
    renderWithProviders(<Profile />, {
      initialAuthState: {
        user: {
          id: 2,
          email: "teacher@univh2c.ma",
          firstName: "Teacher",
          lastName: "User",
          role: "teacher" as const,
          isActive: true,
        },
      },
    });
    expect(await screen.findByText("Enseignant")).toBeInTheDocument();
  });

  it("resolves coordinator role label", async () => {
    renderWithProviders(<Profile />, {
      initialAuthState: {
        user: {
          id: 3,
          email: "coord@univh2c.ma",
          firstName: "Coord",
          lastName: "User",
          role: "coordinator" as const,
          isActive: true,
        },
      },
    });
    expect(await screen.findByText("Coordinateur")).toBeInTheDocument();
  });
});
