import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPlus,
  IconRestore,
  IconTrash,
} from "@tabler/icons-react";
import React, { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";

import { deleteVariable, updateVariableValue } from "@/api/store";
import { storeQueries } from "@/api/storeQueries";
import { formatErrorForToast } from "@/api/utils";
import { useAuth } from "@/auth/AuthContext";
import { RequirePermission } from "@/auth/AuthGate";
import { Permissions } from "@/auth/permissions";
import {
  Badge,
  Button,
  ConfirmDialog,
  CopyButton,
  Icon,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import type { StoredVariable } from "@/types";
import { formatDateTime } from "@/utils";

import {
  descriptionColumn,
  HistoryButton,
  modifiedColumn,
  nameColumn,
  ResourceHistory,
  ResourceTable,
  ResourceToolbar,
  versionColumn,
} from "./ResourceTable";
import { HeaderActions, Mono, RowActions } from "./StorePages.styles";
import { VariableFormModal } from "./VariableFormModal";
import { matchesSearch, shortIdentity } from "./utils";
import { VersionLegend, VersionTimeline } from "./VersionTimeline";

const RevealContext = createContext<{
  revealed: Set<string>;
  setRevealed: React.Dispatch<React.SetStateAction<Set<string>>>;
} | null>(null);

const useReveal = () => {
  const context = useContext(RevealContext);
  if (!context) throw new Error("Variable values require a RevealContext");
  return context;
};

const RevealButton = ({ name }: { name: string }) => {
  const { revealed, setRevealed } = useReveal();
  const visible = revealed.has(name);
  return (
    <Button
      type="button"
      $size={ThemeSize.Small}
      $ghost
      title={visible ? "Hide values" : "Reveal values"}
      aria-label={`${visible ? "Hide" : "Reveal"} values of ${name}`}
      onClick={() =>
        setRevealed((previous) => {
          const next = new Set(previous);
          if (next.has(name)) next.delete(name);
          else next.add(name);
          return next;
        })
      }
    >
      <Icon $icon={visible ? IconEyeOff : IconEye} />
    </Button>
  );
};

const VariableValue = ({
  value,
  name,
  modified,
}: {
  value: string;
  name: string;
  modified?: string;
}) => {
  const visible = useReveal().revealed.has(name);
  return (
    <Mono
      $maxWidth="100%"
      title={visible ? [value, modified].filter(Boolean).join("\n") : undefined}
    >
      {visible ? value : "********"}
    </Mono>
  );
};

const RestoreActions = styled(RowActions)`
  button:disabled {
    border-color: transparent;
  }
`;

const VariableHistory = ({ variable }: { variable: StoredVariable }) => {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery(storeQueries.variableVersions(variable.name));
  const versions = (query.data ?? []).toSorted((a, b) => a.version - b.version);
  // Restoring writes the old value as a new version, so history stays intact.
  const restore = useMutation({
    mutationFn: (value: string) =>
      updateVariableValue(variable.name, variable.version, value),
    onSuccess: (saved) => {
      toast.success(`Restored as v${saved.version}`);
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Could not restore the version"));
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeQueries.variables().queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: storeQueries.variableVersions(variable.name).queryKey,
        }),
      ]);
    },
  });

  return (
    <ResourceHistory query={query} empty={versions.length === 0}>
      <VersionTimeline
        label={`Versions of ${variable.name}`}
        items={versions.map((v) => {
          const modified = `Modified by ${v.created_by} at ${formatDateTime(v.created)}`;
          const blocked =
            v.value === variable.value
              ? "Already the current value"
              : restore.isPending
                ? "Restore in progress"
                : undefined;
          return {
            version: v.version,
            current: v.current,
            state: v.current ? undefined : "previous",
            modifiedTitle: modified,
            details: (
              <VariableValue
                value={v.value}
                name={variable.name}
                modified={modified}
              />
            ),
            action:
              !v.current && can(Permissions.VariableWrite) ? (
                <RestoreActions title={blocked}>
                  <Button
                    $size={ThemeSize.Small}
                    $variant={ThemeVariant.Primary}
                    $ghost
                    title={blocked ?? "Restore version"}
                    aria-label={`Restore version ${v.version} of ${variable.name}`}
                    disabled={!!blocked}
                    onClick={() => restore.mutate(v.value)}
                  >
                    <Icon $icon={IconRestore} />
                  </Button>
                </RestoreActions>
              ) : undefined,
          };
        })}
      />
    </ResourceHistory>
  );
};

type Dialog =
  | { kind: "create" }
  | { kind: "edit" | "delete"; variable: StoredVariable };

export const VariablesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [dialog, setDialog] = useState<Dialog>();
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const close = () => setDialog(undefined);

  const variables = useQuery(storeQueries.variables());

  const remove = useMutation({
    mutationFn: (name: string) => deleteVariable(name),
    onSuccess: (_, name) => {
      setRevealed((previous) => {
        const next = new Set(previous);
        next.delete(name);
        return next;
      });
      toast.success("Variable deleted");
    },
    onError: (err: Error) =>
      toast.error(formatErrorForToast(err, "Could not delete the variable"), {
        duration: 8000,
      }),
    onSettled: () => {
      close();
      void queryClient.invalidateQueries({
        queryKey: storeQueries.variables().queryKey,
      });
    },
  });

  const types = [
    ...new Set([
      ...(variables.data ?? []).map((v) => v.type),
      ...(type ? [type] : []),
    ]),
  ].sort();
  const rows = (variables.data ?? []).filter(
    (v) =>
      (!type || v.type === type) &&
      matchesSearch(search, v.name, v.description, v.type),
  );

  const columns = useMemo<ColumnDef<StoredVariable>[]>(
    () => [
      nameColumn(150),
      {
        accessorKey: "type",
        size: 90,
        header: "Type",
        cell: ({ row }) => (
          <Badge $variant={ThemeVariant.Accent}>{row.original.type}</Badge>
        ),
      },
      {
        accessorKey: "value",
        size: 120,
        header: "Value",
        cell: ({ row }) => (
          <VariableValue value={row.original.value} name={row.original.name} />
        ),
      },
      descriptionColumn(150),
      versionColumn(80),
      modifiedColumn(110),
      {
        accessorKey: "modified_by",
        size: 115,
        header: "Modified by",
        cell: ({ row }) => (
          <span title={row.original.modified_by}>
            {shortIdentity(row.original.modified_by)}
          </span>
        ),
      },
      {
        id: "actions",
        size: 180,
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const v = row.original;
          return (
            <RowActions>
              <HistoryButton row={row} />
              <RevealButton name={v.name} />
              <CopyButton
                $size={ThemeSize.Small}
                $value={v.value}
                title="Copy value"
                aria-label={`Copy value of ${v.name}`}
              />
              <RequirePermission permission={Permissions.VariableWrite}>
                <Button
                  $size={ThemeSize.Small}
                  $variant={ThemeVariant.Primary}
                  $ghost
                  title="Edit"
                  aria-label={`Edit ${v.name}`}
                  onClick={() => setDialog({ kind: "edit", variable: v })}
                >
                  <Icon $icon={IconPencil} />
                </Button>
                <Button
                  $size={ThemeSize.Small}
                  $variant={ThemeVariant.Error}
                  $ghost
                  title="Delete"
                  aria-label={`Delete ${v.name}`}
                  onClick={() => setDialog({ kind: "delete", variable: v })}
                >
                  <Icon $icon={IconTrash} />
                </Button>
              </RequirePermission>
            </RowActions>
          );
        },
      },
    ],
    [],
  );

  return (
    <RevealContext.Provider value={{ revealed, setRevealed }}>
      <ResourceToolbar
        noun="variables"
        type={type}
        types={types}
        onTypeChange={setType}
        search={search}
        onSearchChange={setSearch}
      >
        <HeaderActions>
          <VersionLegend states={["current", "previous"]} />
          <RequirePermission permission={Permissions.VariableWrite}>
            <Button
              $variant={ThemeVariant.Primary}
              onClick={() => setDialog({ kind: "create" })}
            >
              <Icon $icon={IconPlus} />
              New
            </Button>
          </RequirePermission>
        </HeaderActions>
      </ResourceToolbar>
      <ResourceTable
        query={variables}
        errorMessage="Could not load variables"
        data={rows}
        columns={columns}
        label="Variables"
        getRowId={(variable) => variable.name}
        renderDetail={(variable) => <VariableHistory variable={variable} />}
        initialSorting={[{ id: "name", desc: false }]}
        emptyMessage={
          type
            ? "No variables match the filters"
            : search.trim()
              ? `No variables match "${search.trim()}"`
              : "No variables stored"
        }
      />
      {dialog?.kind === "create" && <VariableFormModal onClose={close} />}
      {dialog?.kind === "edit" && (
        <VariableFormModal variable={dialog.variable} onClose={close} />
      )}
      <ConfirmDialog
        $isOpen={dialog?.kind === "delete"}
        $title="Delete variable"
        $description={
          dialog?.kind === "delete" &&
          `Delete '${dialog.variable.name}' and its history? Playbooks that map it must be changed first.`
        }
        $confirmLabel="Delete"
        $confirmVariant={ThemeVariant.Error}
        $isPending={remove.isPending}
        $onCancel={close}
        $onConfirm={() =>
          dialog?.kind === "delete" && remove.mutate(dialog.variable.name)
        }
      />
    </RevealContext.Provider>
  );
};
