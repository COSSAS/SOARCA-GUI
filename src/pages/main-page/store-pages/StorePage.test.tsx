// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "styled-components";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getSecretBackend,
  getSecrets,
  getSecretVersions,
  getVariableVersions,
  getVariables,
  updateVariableDescription,
  updateVariableValue,
} from "@/api/store";
import { AuthContext } from "@/auth/AuthContext";
import { Permissions, type Permission } from "@/auth/permissions";
import { theme } from "@/theme";
import type { SecretMetadata, StoredVariable } from "@/types";

import { StorePage } from "./StorePage";

vi.mock("@/api/store", () => ({
  getVariables: vi.fn(),
  getSecrets: vi.fn(),
  getSecretBackend: vi.fn(),
  getSecretVersions: vi.fn(),
  getVariableVersions: vi.fn(),
  createVariable: vi.fn(),
  updateVariableValue: vi.fn(),
  updateVariableDescription: vi.fn(),
  deleteVariable: vi.fn(),
}));

const variable = (name: string, version: number): StoredVariable => ({
  name,
  version,
  type: "string",
  value: name,
  description: "",
  oldest_version: 1,
  created: "2026-01-01T00:00:00Z",
  modified: "2026-01-01T00:00:00Z",
  created_by: "identity--1",
  modified_by: "identity--1",
});
const secret: SecretMetadata = {
  name: "test-secret",
  kind: "token",
  description: "",
  version: 2,
  oldest_version: 1,
  created: "2026-01-01T00:00:00Z",
  modified: "2026-01-01T00:00:00Z",
};

function renderStore(path: string, permissions: Permission[]) {
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
            can: (permission) => permissions.includes(permission),
            logout: vi.fn(),
            retry: vi.fn(),
          }}
        >
          <MemoryRouter initialEntries={[path]}>
            <StorePage />
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

describe("Secrets and variables page", () => {
  it("sorts and searches variables, then switches to secret versions", async () => {
    vi.mocked(getVariables).mockResolvedValue([
      variable("zebra", 2),
      variable("alpha", 1),
    ]);
    vi.mocked(getSecrets).mockResolvedValue([secret]);
    vi.mocked(getSecretBackend).mockResolvedValue({
      type: "OpenBao",
      production: false,
      versioning: true,
      max_versions: 10,
      operations: ["list", "get"],
      kinds: ["token"],
    });
    vi.mocked(getSecretVersions).mockResolvedValue([
      { version: 2, created: secret.created, current: true },
      { version: 1, created: secret.created, destroyed: true },
    ]);
    renderStore("/variables", [
      Permissions.VariableRead,
      Permissions.VariableWrite,
      Permissions.SecretRead,
    ]);

    const table = await screen.findByRole("table", { name: "Variables" });
    expect(
      within(screen.getByRole("list", { name: "Version colors" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Current", "Previous"]);
    expect(within(table).getAllByRole("row")[1].textContent).toContain("alpha");
    fireEvent.click(within(table).getByRole("button", { name: "Name" }));
    expect(within(table).getAllByRole("row")[1].textContent).toContain("zebra");
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search variables" }),
      { target: { value: "alpha" } },
    );
    expect(within(table).queryByText("zebra")).toBeNull();
    expect(screen.getByText("1 result")).toBeTruthy();

    fireEvent.click(screen.getByRole("link", { name: "Secrets" }));
    const secretsTable = await screen.findByRole("table", { name: "Secrets" });
    expect(
      within(screen.getByRole("list", { name: "Version colors" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Current", "Previous", "Deleted", "Destroyed", "Invalid"]);
    fireEvent.change(
      screen.getByRole("combobox", { name: "Filter secrets by type" }),
      { target: { value: "token" } },
    );
    expect(within(secretsTable).getByText("test-secret")).toBeTruthy();
    expect(getSecretVersions).not.toHaveBeenCalled();
    const history = screen.getByRole("button", {
      name: "View history of test-secret",
    });
    fireEvent.click(history);
    expect(await screen.findByTitle(/^Current version/)).toBeTruthy();
    const versionList = screen.getByRole("list", {
      name: "Versions of test-secret",
    });
    expect(
      within(versionList)
        .getAllByRole("listitem")
        .map((item) => item.textContent?.match(/v\d+/)?.[0]),
    ).toEqual(["v1", "v2"]);
    fireEvent.click(history);
    expect(
      screen.queryByRole("list", { name: "Versions of test-secret" }),
    ).toBeNull();
  });

  it("only shows permitted tabs and write actions", async () => {
    vi.mocked(getVariables).mockResolvedValue([variable("alpha", 2)]);
    renderStore("/variables", [Permissions.VariableRead]);
    expect(
      await screen.findByRole("table", { name: "Variables" }),
    ).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Secrets" })).toBeNull();
    expect(screen.queryByRole("button", { name: "New" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit alpha" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "View history of alpha" }),
    ).toBeTruthy();
  });

  it("copies the complete variable value, including an empty value", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText },
    });
    vi.mocked(getVariables).mockResolvedValue([
      { ...variable("long", 1), value: "https://example.org/a/long/value" },
      { ...variable("empty", 1), value: "" },
    ]);
    renderStore("/variables", [Permissions.VariableRead]);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copy value of long" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Copy value of empty" }),
    );
    await waitFor(() => {
      expect(writeText).toHaveBeenNthCalledWith(
        1,
        "https://example.org/a/long/value",
      );
      expect(writeText).toHaveBeenNthCalledWith(2, "");
    });
  });

  it("reveals and hides a variable and its history together", async () => {
    const current = { ...variable("alpha", 2), value: "current-value" };
    vi.mocked(getVariables).mockResolvedValue([
      current,
      { ...variable("beta", 1), value: "other-value" },
    ]);
    vi.mocked(getVariableVersions).mockResolvedValue([
      {
        version: 1,
        value: "previous-value",
        created: current.created,
        created_by: current.created_by,
      },
      {
        version: 2,
        value: current.value,
        created: current.created,
        created_by: current.created_by,
        current: true,
      },
    ]);
    renderStore("/variables", [Permissions.VariableRead]);

    const table = await screen.findByRole("table", { name: "Variables" });
    expect(table.innerHTML).not.toContain("current-value");
    fireEvent.click(
      screen.getByRole("button", { name: "View history of alpha" }),
    );
    const history = await screen.findByRole("list", {
      name: "Versions of alpha",
    });
    expect(history.innerHTML).not.toContain("previous-value");
    expect(history.innerHTML).not.toContain("current-value");
    const reveal = screen.getByRole("button", {
      name: "Reveal values of alpha",
    });
    reveal.focus();
    fireEvent.click(reveal);
    expect(document.activeElement).toBe(reveal);
    expect(within(history).getByText("previous-value")).toBeTruthy();
    expect(within(history).getByText("current-value")).toBeTruthy();
    expect(within(table).getAllByText("current-value")).toHaveLength(2);
    expect(table.innerHTML).not.toContain("other-value");
    fireEvent.click(
      screen.getByRole("button", { name: "Hide values of alpha" }),
    );
    expect(history.innerHTML).not.toContain("previous-value");
    expect(table.innerHTML).not.toContain("current-value");
  });

  it("filters variables by type together with search and can clear the filter", async () => {
    vi.mocked(getVariables).mockResolvedValue([
      variable("alpha", 1),
      { ...variable("beta", 1), type: "integer", value: "2" },
      { ...variable("gamma", 1), type: "integer", value: "3" },
    ]);
    renderStore("/variables", [Permissions.VariableRead]);
    const table = await screen.findByRole("table", { name: "Variables" });
    const filter = screen.getByRole("combobox", {
      name: "Filter variables by type",
    });
    fireEvent.change(filter, { target: { value: "integer" } });
    expect(within(table).queryByText("alpha")).toBeNull();
    expect(within(table).getByText("beta")).toBeTruthy();
    expect(screen.getByText("2 results")).toBeTruthy();

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search variables" }),
      { target: { value: "alpha" } },
    );
    expect(screen.getByText("No variables match the filters")).toBeTruthy();
    fireEvent.change(filter, { target: { value: "" } });
    expect(within(table).getAllByRole("row")[1].textContent).toContain("alpha");
    expect(screen.getByText("1 result")).toBeTruthy();
  });

  it("shows only the secrets tab for users without variable access", async () => {
    vi.mocked(getSecrets).mockResolvedValue([secret]);
    vi.mocked(getSecretBackend).mockResolvedValue({
      type: "OpenBao",
      production: false,
      versioning: true,
      max_versions: 10,
      operations: ["list", "get"],
      kinds: ["token"],
    });
    renderStore("/secrets", [Permissions.SecretRead]);
    expect(await screen.findByRole("table", { name: "Secrets" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Variables" })).toBeNull();
    expect(getVariables).not.toHaveBeenCalled();
  });

  it("shows a retryable error instead of an empty table", async () => {
    vi.mocked(getVariables).mockRejectedValue(new Error("offline"));
    renderStore("/variables", [Permissions.VariableRead]);
    expect(await screen.findByText(/Could not load variables/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.queryByText("No variables stored")).toBeNull();
  });

  it.each(["variable", "secret"] as const)(
    "opens the %s history while its versions are loading",
    async (kind) => {
      vi.mocked(getVariables).mockResolvedValue([variable("alpha", 2)]);
      vi.mocked(getSecrets).mockResolvedValue([secret]);
      vi.mocked(getSecretBackend).mockResolvedValue({
        type: "OpenBao",
        production: false,
        versioning: true,
        max_versions: 10,
        operations: ["list", "get"],
        kinds: ["token"],
      });
      let loaded = () => {};
      const pending = new Promise<void>((resolve) => (loaded = resolve));
      const created = secret.created;
      vi.mocked(getVariableVersions).mockImplementation(async () => {
        await pending;
        return [
          { version: 1, value: "old", created, created_by: "admin" },
          { version: 2, value: "new", created, created_by: "admin" },
        ];
      });
      vi.mocked(getSecretVersions).mockImplementation(async () => {
        await pending;
        return [
          { version: 1, created },
          { version: 2, created, current: true },
        ];
      });
      const name = kind === "variable" ? "alpha" : "test-secret";
      renderStore(kind === "variable" ? "/variables" : "/secrets", [
        Permissions.VariableRead,
        Permissions.SecretRead,
      ]);
      const history = await screen.findByRole("button", {
        name: `View history of ${name}`,
      });
      fireEvent.click(history);
      const versions = { name: `Versions of ${name}` };
      expect(screen.queryByRole("list", versions)).toBeNull();
      loaded();
      expect(await screen.findByRole("list", versions)).toBeTruthy();
      fireEvent.click(history);
      expect(screen.queryByRole("list", versions)).toBeNull();
    },
  );

  it("keeps the expanded secret with its row when sorting and reports failed history requests", async () => {
    vi.mocked(getSecrets).mockResolvedValue([
      secret,
      { ...secret, name: "another" },
    ]);
    vi.mocked(getSecretBackend).mockResolvedValue({
      type: "OpenBao",
      production: false,
      versioning: true,
      max_versions: 10,
      operations: ["list", "get"],
      kinds: ["token"],
    });
    vi.mocked(getSecretVersions)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([
        { version: 1, created: secret.created, destroyed: true },
      ]);
    renderStore("/secrets", [Permissions.SecretRead]);
    const table = await screen.findByRole("table", { name: "Secrets" });
    fireEvent.click(
      within(table).getByRole("button", {
        name: "View history of test-secret",
      }),
    );
    expect(await screen.findByText(/Could not load the versions/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByTitle(/^Destroyed/)).toBeTruthy();
    fireEvent.click(within(table).getByRole("button", { name: "Name" }));
    const timeline = screen.getByRole("list", {
      name: "Versions of test-secret",
    });
    expect(
      timeline.closest("tr")?.previousElementSibling?.textContent,
    ).toContain("test-secret");
    expect(getSecretVersions).toHaveBeenCalledWith("test-secret");
  });

  it("restores a variable version from the history and hides restore without permission", async () => {
    const current = variable("alpha", 2);
    const versions = [
      {
        version: 1,
        value: "old",
        created: current.created,
        created_by: "identity--1",
      },
      {
        version: 2,
        value: current.value,
        created: current.created,
        created_by: "identity--1",
        current: true,
      },
    ];
    vi.mocked(getVariables).mockResolvedValue([current]);
    vi.mocked(getVariableVersions).mockResolvedValue(versions);
    vi.mocked(updateVariableValue).mockResolvedValue({
      ...current,
      version: 3,
      value: "old",
    });
    const page = renderStore("/variables", [
      Permissions.VariableRead,
      Permissions.VariableWrite,
    ]);
    fireEvent.click(
      await screen.findByRole("button", { name: "View history of alpha" }),
    );
    const restore = await screen.findByRole("button", {
      name: "Restore version 1 of alpha",
    });
    fireEvent.click(restore);
    await waitFor(() =>
      expect(updateVariableValue).toHaveBeenCalledWith("alpha", 2, "old"),
    );
    page.unmount();
    renderStore("/variables", [Permissions.VariableRead]);
    fireEvent.click(
      await screen.findByRole("button", { name: "View history of alpha" }),
    );
    expect(
      await screen.findByRole("list", { name: "Versions of alpha" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Restore version 1 of alpha" }),
    ).toBeNull();
  });

  it("saves the description and reports a partial save", async () => {
    const toastError = vi.spyOn(toast, "error");
    vi.mocked(getVariables).mockResolvedValue([variable("alpha", 2)]);
    vi.mocked(updateVariableDescription).mockResolvedValue(
      variable("alpha", 2),
    );
    vi.mocked(updateVariableValue).mockRejectedValue(new Error("Conflict"));
    renderStore("/variables", [
      Permissions.VariableRead,
      Permissions.VariableWrite,
    ]);

    fireEvent.click(await screen.findByRole("button", { name: "Edit alpha" }));
    fireEvent.change(screen.getByLabelText("Value"), {
      target: { value: "beta" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "new" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        expect.stringMatching(
          /^The description was saved, but the value was not\. /,
        ),
      ),
    );
    expect(updateVariableDescription).toHaveBeenCalledWith("alpha", "new");
    expect(updateVariableValue).toHaveBeenCalledWith("alpha", 2, "beta");
    expect(screen.getByRole("dialog", { name: "Edit variable" })).toBeTruthy();
  });

  it("explains disabled restores", async () => {
    const current = variable("alpha", 3);
    vi.mocked(getVariables).mockResolvedValue([current]);
    vi.mocked(getVariableVersions).mockResolvedValue(
      ["alpha", "old", "alpha"].map((value, index) => ({
        version: index + 1,
        value,
        created: current.created,
        created_by: "identity--1",
        current: index === 2,
      })),
    );
    vi.mocked(updateVariableValue).mockImplementation(
      () => new Promise(() => {}),
    );
    renderStore("/variables", [
      Permissions.VariableRead,
      Permissions.VariableWrite,
    ]);
    fireEvent.click(
      await screen.findByRole("button", { name: "View history of alpha" }),
    );
    const sameValue = await screen.findByRole("button", {
      name: "Restore version 1 of alpha",
    });
    const restore = screen.getByRole("button", {
      name: "Restore version 2 of alpha",
    });
    expect(sameValue.hasAttribute("disabled")).toBe(true);
    expect(sameValue.getAttribute("title")).toBe("Already the current value");
    fireEvent.click(restore);
    await waitFor(() => expect(restore.hasAttribute("disabled")).toBe(true));
    expect(restore.getAttribute("title")).toBe("Restore in progress");
  });

  it.each(["variable", "secret"] as const)(
    "hides %s history when only one version is retained",
    async (kind) => {
      vi.mocked(getVariables).mockResolvedValue([
        variable("first", 1),
        { ...variable("pruned", 4), oldest_version: 4 },
        { ...variable("multiple", 5), oldest_version: 4 },
      ]);
      vi.mocked(getSecrets).mockResolvedValue([
        { ...secret, name: "first", version: 1 },
        { ...secret, name: "pruned", version: 4, oldest_version: 4 },
        { ...secret, name: "multiple", version: 5, oldest_version: 4 },
      ]);
      renderStore(kind === "variable" ? "/variables" : "/secrets", [
        Permissions.VariableRead,
        Permissions.SecretRead,
      ]);
      await screen.findByRole("table", {
        name: kind === "variable" ? "Variables" : "Secrets",
      });
      expect(
        screen.queryByRole("button", { name: "View history of first" }),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: "View history of pruned" }),
      ).toBeNull();
      expect(
        screen.getByRole("button", { name: "View history of multiple" }),
      ).toBeTruthy();
      expect(getVariableVersions).not.toHaveBeenCalled();
      expect(getSecretVersions).not.toHaveBeenCalled();
    },
  );
});
