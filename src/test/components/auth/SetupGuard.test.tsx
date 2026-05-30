import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import SetupGuard from "@/components/auth/SetupGuard";

function renderWithGuard(setupCompleted: boolean) {
  server.use(
    http.get("*/api/admin/config/general", () =>
      HttpResponse.json({
        setupCompleted,
        institutionName: "Test Univ",
        institutionLogoUrl: "",
        timezone: "UTC",
        dateFormat: "DD/MM/YYYY",
      }),
    ),
  );

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<SetupGuard />}>
            <Route path="/" element={<div data-testid="child-content">Protected</div>} />
          </Route>
          <Route path="/admin/config" element={<div data-testid="config-page">Config</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SetupGuard", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("renders child route when setup is completed", async () => {
    renderWithGuard(true);
    expect(await screen.findByTestId("child-content")).toBeInTheDocument();
    expect(screen.queryByTestId("config-page")).not.toBeInTheDocument();
  });

  it("redirects to /admin/config when setup is not completed", async () => {
    renderWithGuard(false);
    expect(await screen.findByTestId("config-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });
});
