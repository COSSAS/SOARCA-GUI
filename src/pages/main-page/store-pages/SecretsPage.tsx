import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";

import { storeQueries } from "@/api/storeQueries";
import { Badge, ThemeVariant } from "@/components";
import type { SecretMetadata } from "@/types";
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
import { Muted, RowActions } from "./StorePages.styles";
import { matchesSearch } from "./utils";
import { VersionLegend, VersionTimeline } from "./VersionTimeline";

const KindBadge = ({ kind }: { kind: SecretMetadata["kind"] }) =>
  kind === "invalid" ? (
    <Badge
      $variant={ThemeVariant.Accent}
      title="SOARCA cannot read this entry. Fix it in the secret backend."
    >
      invalid
    </Badge>
  ) : (
    <Badge $variant={ThemeVariant.Accent}>{kind}</Badge>
  );

const SecretVersions = ({ secret }: { secret: SecretMetadata }) => {
  const query = useQuery(storeQueries.secretVersions(secret.name));
  const versions = (query.data ?? []).toSorted((a, b) => a.version - b.version);
  return (
    <ResourceHistory
      query={query}
      empty={versions.length === 0}
      note={
        secret.oldest_version > 1 && (
          <Muted>
            Versions before v{secret.oldest_version} are no longer kept.
          </Muted>
        )
      }
    >
      <VersionTimeline
        label={`Versions of ${secret.name}`}
        items={versions.map((v) => ({
          version: v.version,
          current: v.current,
          state: v.destroyed
            ? "destroyed"
            : v.deleted
              ? "deleted"
              : v.current
                ? undefined
                : "previous",
          modifiedTitle: v.deleted
            ? `Created at ${formatDateTime(v.created)}\nDeleted at ${formatDateTime(v.deleted)}`
            : `Created at ${formatDateTime(v.created)}`,
        }))}
      />
    </ResourceHistory>
  );
};

export const SecretsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");

  const backend = useQuery(storeQueries.secretBackend());
  const secrets = useQuery(storeQueries.secrets());

  const rows = (secrets.data ?? []).filter(
    (s) =>
      (!kind || s.kind === kind) &&
      matchesSearch(search, s.name, s.description),
  );

  const columns = useMemo<ColumnDef<SecretMetadata>[]>(
    () => [
      nameColumn(160),
      {
        accessorKey: "kind",
        size: 120,
        header: "Type",
        cell: ({ row }) => <KindBadge kind={row.original.kind} />,
      },
      descriptionColumn(180),
      versionColumn(90),
      modifiedColumn(120),
      {
        id: "actions",
        size: 130,
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <RowActions>
            <HistoryButton row={row} />
          </RowActions>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <ResourceToolbar
        noun="secrets"
        type={kind}
        types={backend.data?.kinds ?? []}
        onTypeChange={setKind}
        search={search}
        onSearchChange={setSearch}
      >
        <VersionLegend
          states={["current", "previous", "deleted", "destroyed", "invalid"]}
        />
      </ResourceToolbar>
      <ResourceTable
        query={secrets}
        errorMessage="Could not load secrets"
        data={rows}
        columns={columns}
        label="Secrets"
        getRowId={(secret) => secret.name}
        renderDetail={(secret) => <SecretVersions secret={secret} />}
        initialSorting={[{ id: "name", desc: false }]}
        emptyMessage={
          search.trim() || kind
            ? "No secrets match the filter"
            : "No secrets stored"
        }
      />
    </>
  );
};
