import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { STORAGE_KEYS } from "@/lib/constants";


function TestConsumer() {
  const { user, token, isAuthenticated, isLoading, wasExpired, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="was-expired">{String(wasExpired)}</div>
      <div data-testid="token">{token ?? "null"}</div>
      <div data-testid="user-email">{user?.email ?? "null"}</div>
      <button
        data-testid="login-btn"
        onClick={() =>
          login(
            "test-token",
            { id: "1", email: "test@test.com", firstName: "Test", lastName: "User", role: "admin", isActive: true },
            Date.now() + 3600000,
          )
        }
      />
      <button data-testid="logout-btn" onClick={logout} />
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows no authentication after mount", async () => {
    renderWithAuth();
    expect(await screen.findByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-email")).toHaveTextContent("null");
  });

  it("restores session from localStorage if not expired", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "stored-token");
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({
        id: "2",
        email: "stored@test.com",
        firstName: "Stored",
        lastName: "User",
        role: "teacher",
        isActive: true,
      }),
    );
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() + 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("token")).toHaveTextContent("stored-token");
    expect(screen.getByTestId("user-email")).toHaveTextContent("stored@test.com");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("clears expired session and sets wasExpired", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "expired-token");
    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ id: "3", email: "expired@test.com", firstName: "Exp", lastName: "User", role: "student", isActive: true }),
    );
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() - 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("was-expired")).toHaveTextContent("true");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
  });

  it("clears invalid stored user data", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "bad-token");
    localStorage.setItem(STORAGE_KEYS.USER, '"not a valid user object"');
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(Date.now() + 3600000));

    renderWithAuth();

    expect(await screen.findByTestId("token")).toHaveTextContent("null");
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it("login stores token and user", async () => {
    const user = userEvent.setup();
    renderWithAuth();

    expect(await screen.findByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");

    await user.click(screen.getByTestId("login-btn"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("token")).toHaveTextContent("test-token");
    expect(screen.getByTestId("user-email")).toHaveTextContent("test@test.com");
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe("test-token");
  });

  it("logout clears token and user", async () => {
    const user = userEvent.setup();
    renderWithAuth();

    expect(await screen.findByTestId("loading")).toHaveTextContent("false");
    await user.click(screen.getByTestId("login-btn"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");

    await user.click(screen.getByTestId("logout-btn"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
