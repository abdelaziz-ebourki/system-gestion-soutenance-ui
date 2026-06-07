import { describe, it, expect, vi, beforeEach } from "vitest";
import { cn, getFullName, getErrorMessage } from "@/lib/utils";
import { ApiError } from "@/lib/api-error";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const show = false;
    expect(cn("base", show && "hidden", "visible")).toBe("base visible");
  });

  it("handles array of classes", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});

describe("getFullName", () => {
  it("returns full name with first and last name", () => {
    expect(getFullName({ firstName: "John", lastName: "Doe" })).toBe("John Doe");
  });

  it("trims leading/trailing spaces", () => {
    expect(getFullName({ firstName: "  John", lastName: "Doe  " })).toBe("John Doe");
  });
});

describe("getErrorMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error message when given an Error", () => {
    expect(getErrorMessage(new Error("Something broke"), "Fallback")).toBe("Something broke");
  });

  it("shows fallback message when given a non-Error", () => {
    expect(getErrorMessage("string error", "Fallback message")).toBe("Fallback message");
  });

  it("shows fallback message when given null", () => {
    expect(getErrorMessage(null, "Null fallback")).toBe("Null fallback");
  });

  it("shows timeout message for ApiError.isTimeout", () => {
    const err = new ApiError({ status: null, message: "timeout", isTimeout: true });
    expect(getErrorMessage(err, "Fallback")).toBe("La requête a expiré. Veuillez réessayer.");
  });

  it("shows network error message for ApiError.isNetworkError", () => {
    const err = new ApiError({ status: null, message: "network fail", isNetworkError: true });
    expect(getErrorMessage(err, "Fallback")).toBe("Impossible de contacter le serveur. Vérifiez votre connexion.");
  });

  it("shows mapped message for known ApiError status", () => {
    const err = new ApiError({ status: 400, message: "bad request" });
    expect(getErrorMessage(err, "Fallback")).toBe("La requête est invalide.");
  });

  it("shows field errors for 422 ApiError", () => {
    const err = new ApiError({ status: 422, message: "validation failed", fieldErrors: { name: "Name required", email: "Email invalid", age: "Too young" } });
    expect(getErrorMessage(err, "Fallback")).toBe("Name required\nEmail invalid\nToo young");
  });

  it("shows error.message for unknown ApiError status", () => {
    const err = new ApiError({ status: 418, message: "I'm a teapot" });
    expect(getErrorMessage(err, "Fallback")).toBe("I'm a teapot");
  });
});
