import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { cn, getFullName, toastError, formatDate, formatTime } from "@/lib/utils";
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

describe("formatDate", () => {
  it("formats ISO string correctly", () => {
    expect(formatDate("2026-06-01")).toBe("01 juin 2026");
  });

  it("handles Date objects", () => {
    const date = new Date(2026, 5, 1); // June 1st (month is 0-indexed)
    expect(formatDate(date)).toBe("01 juin 2026");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("uses custom pattern", () => {
    expect(formatDate("2026-06-01", "yyyy/MM/dd")).toBe("2026/06/01");
  });

  it("falls back to string representation on error", () => {
    expect(formatDate("invalid-date")).toBe("invalid-date");
  });
});

describe("formatTime", () => {
  it("formats HH:mm correctly", () => {
    expect(formatTime("09:30")).toBe("09:30");
  });

  it("trims HH:mm:ss to HH:mm", () => {
    expect(formatTime("09:30:45")).toBe("09:30");
  });

  it("returns empty string for empty input", () => {
    expect(formatTime("")).toBe("");
  });
});

describe("toastError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error message when given an Error", () => {
    toastError(new Error("Something broke"), "Fallback");
    expect(toast.error).toHaveBeenCalledWith("Something broke");
  });

  it("shows fallback message when given a non-Error", () => {
    toastError("string error", "Fallback message");
    expect(toast.error).toHaveBeenCalledWith("Fallback message");
  });

  it("shows fallback message when given null", () => {
    toastError(null, "Null fallback");
    expect(toast.error).toHaveBeenCalledWith("Null fallback");
  });

  it("shows timeout message for ApiError.isTimeout", () => {
    const err = new ApiError({ status: null, message: "timeout", isTimeout: true });
    toastError(err, "Fallback");
    expect(toast.error).toHaveBeenCalledWith("La requête a expiré. Veuillez réessayer.");
  });

  it("shows network error message for ApiError.isNetworkError", () => {
    const err = new ApiError({ status: null, message: "network fail", isNetworkError: true });
    toastError(err, "Fallback");
    expect(toast.error).toHaveBeenCalledWith("Impossible de contacter le serveur. Vérifiez votre connexion.");
  });

  it("shows mapped message for known ApiError status", () => {
    const err = new ApiError({ status: 400, message: "bad request" });
    toastError(err, "Fallback");
    expect(toast.error).toHaveBeenCalledWith("La requête est invalide.");
  });

  it("shows field errors for 422 ApiError", () => {
    const err = new ApiError({ status: 422, message: "validation failed", fieldErrors: { name: "Name required", email: "Email invalid", age: "Too young" } });
    toastError(err, "Fallback");
    expect(toast.error).toHaveBeenCalledWith("Name required\nEmail invalid\nToo young");
  });

  it("shows error.message for unknown ApiError status", () => {
    const err = new ApiError({ status: 418, message: "I'm a teapot" });
    toastError(err, "Fallback");
    expect(toast.error).toHaveBeenCalledWith("I'm a teapot");
  });
});
