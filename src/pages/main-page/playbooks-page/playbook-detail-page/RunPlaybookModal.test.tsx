// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { resolvePlaybook } from "@/api/store";
import { triggerPlaybookById } from "@/api/trigger";
import { AuthContext } from "@/auth/AuthContext";
import { theme } from "@/theme";
import type { Execution, Playbook, PlaybookResolve } from "@/types";

import { RunPlaybookModal } from "./RunPlaybookModal";

vi.mock("@/api/store", () => ({ resolvePlaybook: vi.fn() }));
vi.mock("@/api/trigger", () => ({ triggerPlaybookById: vi.fn() }));

const playbook = {
  id: "playbook--1",
  playbook_variables: {
    __token__: { type: "string", external: true },
    __host__: { type: "string", external: true, value: "a" },
  },
} as unknown as Playbook;

const resolved = (patch: Partial<PlaybookResolve>): PlaybookResolve => ({
  playbook_id: playbook.id,
  ready: true,
  variables: [
    { ref: "__token__", source: { secret: "jira" }, version: 1, status: "ok" },
  ],
  unmapped: [],
  ...patch,
});

function renderModal() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider
          value={{
            user: null,
            noAccess: false,
            isLoading: false,
            isError: false,
            can: () => true,
            logout: vi.fn(),
            retry: vi.fn(),
          }}
        >
          <RunPlaybookModal
            playbook={playbook}
            isOpen
            onClose={vi.fn()}
            onSuccess={vi.fn()}
          />
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

const runButton = (name: string) =>
  screen.getByRole<HTMLButtonElement>("button", { name });

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("RunPlaybookModal", () => {
  it("does not offer a run while the mapping is being checked", () => {
    vi.mocked(resolvePlaybook).mockReturnValue(new Promise(() => {}));
    renderModal();
    expect(runButton("Run with variables").disabled).toBe(true);
    expect(runButton("Run without variables").disabled).toBe(true);
  });

  it("only allows a run without variables when the check fails", async () => {
    vi.mocked(resolvePlaybook).mockRejectedValue(new Error("Unavailable"));
    renderModal();
    expect(
      await screen.findByText(
        /Could not check which variables come from the playbook mapping/,
      ),
    ).toBeTruthy();
    expect(runButton("Run with variables").disabled).toBe(true);
    expect(runButton("Run without variables").disabled).toBe(false);
  });

  it("sends only the unmapped external variables when nothing else blocks the run", async () => {
    vi.mocked(resolvePlaybook).mockResolvedValue(
      resolved({ ready: false, unmapped: ["__host__"] }),
    );
    vi.mocked(triggerPlaybookById).mockResolvedValue({} as Execution);
    renderModal();
    await waitFor(() =>
      expect(runButton("Run with variables").disabled).toBe(false),
    );
    fireEvent.click(runButton("Run with variables"));
    await waitFor(() =>
      expect(triggerPlaybookById).toHaveBeenCalledWith(playbook.id, {
        __host__: { type: "string", value: "a" },
      }),
    );
  });

  it("blocks the run when a mapped variable cannot be read", async () => {
    vi.mocked(resolvePlaybook).mockResolvedValue(
      resolved({
        ready: false,
        variables: [
          { ref: "__token__", source: { secret: "jira" }, status: "missing" },
        ],
      }),
    );
    renderModal();
    expect(
      await screen.findByText(/Some mapped variables cannot be read/),
    ).toBeTruthy();
    expect(runButton("Run with variables").disabled).toBe(true);
    expect(runButton("Run without variables").disabled).toBe(true);
  });
});
