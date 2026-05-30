import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { cn, getFullName, toastError } from "@/lib/utils";

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
});
