import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./utils";
import App from "@/App";
import { ROUTES } from "@/config/routes";

describe("Infrastructure Validation", () => {
  it("should redirect unauthenticated user to login page", async () => {
    renderWithProviders(<App />, {
      initialEntries: [ROUTES.ADMIN.DASHBOARD],
      initialAuthState: {
        user: undefined,
      },
    });

    // Use findByText to wait for lazy loading
    const loginHeading = await screen.findByText(/connexion/i);
    expect(loginHeading).toBeInTheDocument();
  });

  it("should allow admin user to access admin dashboard", async () => {
    renderWithProviders(<App />, {
      initialEntries: [ROUTES.ADMIN.DASHBOARD],
      initialAuthState: {
        user: {
          id: 1,
          firstName: "Admin",
          lastName: "User",
          email: "admin@univh2c.ma",
          role: "admin",
          isActive: true,
        },
      },
    });

    const dashboardHeading = await screen.findByText(/Tableau de Bord/i);
    expect(dashboardHeading).toBeInTheDocument();
  });

  it("should redirect student user away from admin dashboard", async () => {
    renderWithProviders(<App />, {
      initialEntries: [ROUTES.ADMIN.DASHBOARD],
      initialAuthState: {
        user: {
          id: 2,
          firstName: "Student",
          lastName: "User",
          email: "student@univh2c.ma",
          role: "student",
          isActive: true,
        },
      },
    });

    // The student should be redirected to their own dashboard or a generic page
    const dashboardHeading = screen.queryByText(/Tableau de bord Administrateur/i);
    expect(dashboardHeading).not.toBeInTheDocument();
  });
});
