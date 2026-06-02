import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api-core";
import { STORAGE_KEYS } from "@/lib/constants";

describe("API Wrapper CSRF & Cookies", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
    // Clear cookies
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should add X-XSRF-TOKEN header for mutating requests when cookie is present", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ "content-type": "application/json" }),
    } as Response);

    await api("/test", { method: "POST", body: JSON.stringify({ data: "test" }) });

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;

    expect(headers["X-XSRF-TOKEN"]).toBe("test-token");
    expect(fetchCall[1]?.credentials).toBe("include");
  });

  it("should NOT add X-XSRF-TOKEN header for GET requests", async () => {
    document.cookie = "XSRF-TOKEN=test-token";
    
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ "content-type": "application/json" }),
    } as Response);

    await api("/test", { method: "GET" });

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;

    expect(headers["X-XSRF-TOKEN"]).toBeUndefined();
    expect(fetchCall[1]?.credentials).toBe("include");
  });

  it("should still include Authorization header if token exists", async () => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, "mock-jwt");
    
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ "content-type": "application/json" }),
    } as Response);

    await api("/test", { method: "GET" });

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1]?.headers as Record<string, string>;

    expect(headers["Authorization"]).toBe("Bearer mock-jwt");
  });
});
