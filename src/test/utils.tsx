import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { STORAGE_KEYS } from "@/lib/constants";
import type { User } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperOptions {
  initialEntries?: string[];
  initialAuthState?: {
    user?: User;
    token?: string;
    expiresAt?: number;
  };
}

function createWrapper(options: WrapperOptions = {}) {
  const queryClient = createTestQueryClient();
  const { initialEntries = ["/"], initialAuthState } = options;

  if (initialAuthState) {
    if (initialAuthState.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, initialAuthState.token);
    }
    if (initialAuthState.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(initialAuthState.user));
    }
    if (initialAuthState.expiresAt) {
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, initialAuthState.expiresAt.toString());
    } else if (initialAuthState.token || initialAuthState.user) {
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, (Date.now() + 7200000).toString());
    }
  } else {
    localStorage.clear();
  }

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <MemoryRouter initialEntries={initialEntries}>
              {children}
            </MemoryRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & WrapperOptions = {},
) {
  const { initialEntries, initialAuthState, ...renderOptions } = options;
  const wrapper = createWrapper({ initialEntries, initialAuthState });

  return {
    ...render(ui, { wrapper, ...renderOptions }),
  };
}
