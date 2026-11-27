import type { UseQueryResult } from "@tanstack/react-query";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { IconHistory } from "@tabler/icons-react";
import type { PropsWithChildren, ReactNode } from "react";

import { getErrorFromApiResponse } from "@/api/utils";
import {
  Button,
  CenteredCardContent,
  DataTable,
  Icon,
  Input,
  Select,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
  type DataTableProps,
} from "@/components";

import {
  HeaderActions,
  HistoryLoading,
  Muted,
  TableInset,
  TableNotice,
  TableText,
  TableToolbar,
} from "./StorePages.styles";
import { formatStoreDate } from "./utils";

// Shared parts of the Secrets and Variables tabs.

type Loadable = Pick<
  UseQueryResult<unknown, unknown>,
  "isLoading" | "isError" | "error" | "refetch"
>;

type Resource = {
  name: string;
  description: string;
  version: number;
  oldest_version: number;
  modified: string;
};

const ErrorText = ({
  query,
  fallback,
}: {
  query: Loadable;
  fallback: string;
}) => (
  <>
    {getErrorFromApiResponse(query.error).message || fallback}{" "}
    <Button $size={ThemeSize.Small} $ghost onClick={() => void query.refetch()}>
      Try again
    </Button>
  </>
);

export function ResourceToolbar({
  noun,
  type,
  types,
  onTypeChange,
  search,
  onSearchChange,
  children,
}: PropsWithChildren<{
  /** Plural, for example `secrets`. */
  noun: string;
  type: string;
  types: string[];
  onTypeChange: (type: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}>) {
  return (
    <TableToolbar>
      <HeaderActions>
        <Select
          aria-label={`Filter ${noun} by type`}
          $value={type}
          $onChange={onTypeChange}
          $placeholder="All types"
          $options={types.map((value) => ({ value, label: value }))}
        />
        <Input
          type="search"
          placeholder={`Search ${noun}`}
          aria-label={`Search ${noun}`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </HeaderActions>
      {children}
    </TableToolbar>
  );
}

/** The table of a tab, or its loading or error state. */
export function ResourceTable<T>({
  query,
  errorMessage,
  ...table
}: DataTableProps<T> & { query: Loadable; errorMessage: string }) {
  if (query.isLoading)
    return (
      <CenteredCardContent>
        <Spinner $size={ThemeSize.Medium} />
      </CenteredCardContent>
    );
  if (query.isError)
    return (
      <TableNotice>
        <ErrorText query={query} fallback={errorMessage} />
      </TableNotice>
    );
  return (
    <TableInset>
      <DataTable {...table} />
    </TableInset>
  );
}

/** The expanded history of a row, with its loading, error and empty states. */
export function ResourceHistory({
  query,
  empty,
  note,
  children,
}: PropsWithChildren<{
  query: Loadable;
  empty: boolean;
  /** Shown above the versions once they are loaded. */
  note?: ReactNode;
}>) {
  return (
    <section>
      {!query.isLoading && note}
      {query.isLoading && (
        <HistoryLoading>
          <Spinner $size={ThemeSize.Small} />
        </HistoryLoading>
      )}
      {query.isError && (
        <Text>
          <ErrorText query={query} fallback="Could not load the versions" />
        </Text>
      )}
      {!query.isLoading && !query.isError && empty && (
        <Text>No versions available.</Text>
      )}
      {!empty && !query.isError && children}
    </section>
  );
}

/** Toggles the history row. Hidden when only one version is kept. */
export function HistoryButton<T extends Resource>({ row }: { row: Row<T> }) {
  const { name, version, oldest_version } = row.original;
  if (version <= oldest_version) return null;
  return (
    <Button
      $size={ThemeSize.Small}
      $variant={ThemeVariant.Primary}
      $ghost
      title="View history"
      aria-label={`View history of ${name}`}
      onClick={() => row.toggleExpanded()}
    >
      <Icon $icon={IconHistory} />
    </Button>
  );
}

export const nameColumn = <T extends Resource>(size: number): ColumnDef<T> => ({
  id: "name",
  accessorFn: (r) => r.name,
  size,
  header: "Name",
  cell: ({ row }) => (
    <TableText title={row.original.name}>{row.original.name}</TableText>
  ),
});

export const descriptionColumn = <T extends Resource>(
  size: number,
): ColumnDef<T> => ({
  id: "description",
  accessorFn: (r) => r.description,
  size,
  header: "Description",
  cell: ({ row }) =>
    row.original.description ? (
      <TableText title={row.original.description}>
        {row.original.description}
      </TableText>
    ) : (
      <Muted>No description</Muted>
    ),
});

export const versionColumn = <T extends Resource>(
  size: number,
): ColumnDef<T> => ({
  id: "version",
  accessorFn: (r) => r.version,
  size,
  header: "Version",
  cell: ({ row }) => `v${row.original.version}`,
});

export const modifiedColumn = <T extends Resource>(
  size: number,
): ColumnDef<T> => ({
  id: "modified",
  accessorFn: (r) => r.modified,
  size,
  header: "Modified",
  cell: ({ row }) => formatStoreDate(row.original.modified),
});
