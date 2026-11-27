import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";

import { deletePlaybookMapping, savePlaybookMapping } from "@/api/store";
import { storeQueries } from "@/api/storeQueries";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import { useAuth } from "@/auth/AuthContext";
import { Permissions } from "@/auth/permissions";
import {
  Badge,
  Button,
  Input,
  Select,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import {
  ReferenceStatusBadge,
  STATUS_LABELS,
} from "@/pages/main-page/store-pages/ReferenceStatusBadge";
import type {
  MappingSource,
  Playbook,
  PlaybookMapping as Mapping,
  ResolvedVariable,
} from "@/types";

import { Hint, SectionTitle } from "../visual-editor/panels/Panel.styles";

const MappingList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MappingItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const ItemHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  justify-content: space-between;

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  overflow-wrap: anywhere;
`;

const SourceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 5.5rem;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

type Draft = Record<string, { source: string; version: string }>;

// Select values look like `secret:jira-token` or `variable:fw-api-user`.
const toDraft = (mapping: Mapping | null | undefined): Draft =>
  Object.fromEntries(
    Object.entries(mapping?.variables ?? {}).map(([ref, s]) => [
      ref,
      {
        source: "secret" in s ? `secret:${s.secret}` : `variable:${s.variable}`,
        version: s.version ? String(s.version) : "",
      },
    ]),
  );

const fromDraft = (draft: Draft): Record<string, MappingSource> =>
  Object.fromEntries(
    Object.entries(draft)
      .filter(([, d]) => d.source)
      .map(([ref, d]) => {
        const [kind, ...rest] = d.source.split(":");
        const name = rest.join(":");
        const pinned = d.version ? { version: Number(d.version) } : {};
        const source: MappingSource =
          kind === "secret"
            ? { secret: name, ...pinned }
            : { variable: name, ...pinned };
        return [ref, source];
      }),
  );

const StatusBadge = ({ resolved }: { resolved?: ResolvedVariable }) =>
  resolved ? (
    <ReferenceStatusBadge status={resolved.status}>
      {STATUS_LABELS[resolved.status]}
      {resolved.version ? ` v${resolved.version}` : ""}
    </ReferenceStatusBadge>
  ) : (
    <Badge $variant={ThemeVariant.Primary} title="Asked for at run time">
      At run time
    </Badge>
  );

const MappingForm = ({
  playbook,
  mapping,
}: {
  playbook: Playbook;
  mapping: Mapping | null;
}) => {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const canWrite = can(Permissions.MappingWrite);
  const [draft, setDraft] = useState<Draft>(() => toDraft(mapping));

  const externals = Object.entries(playbook.playbook_variables ?? {}).filter(
    ([, v]) => v.external === true,
  );
  const secrets = useQuery({
    ...storeQueries.secrets(),
    enabled: can(Permissions.SecretRead),
  });
  const variables = useQuery({
    ...storeQueries.variables(),
    enabled: can(Permissions.VariableRead),
  });
  const resolve = useQuery(storeQueries.resolve(playbook.id));
  const resolved = new Map(resolve.data?.variables.map((v) => [v.ref, v]));

  const save = useMutation({
    mutationFn: async (): Promise<void> => {
      const next = fromDraft(draft);
      if (Object.keys(next).length === 0 && mapping)
        await deletePlaybookMapping(playbook.id);
      else await savePlaybookMapping(playbook.id, mapping?.version ?? 0, next);
    },
    onSuccess: () => toast.success("Mapping saved"),
    onError: (err: Error) =>
      toast.error(formatErrorForToast(err, "Could not save the mapping")),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: storeQueries.mapping(playbook.id).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: storeQueries.resolve(playbook.id).queryKey,
      });
    },
  });

  const changed =
    JSON.stringify(fromDraft(draft)) !==
    JSON.stringify(fromDraft(toDraft(mapping)));

  const update = (ref: string, patch: Partial<Draft[string]>) =>
    setDraft((prev) => ({
      ...prev,
      [ref]: { ...(prev[ref] ?? { source: "", version: "" }), ...patch },
    }));

  const optionsFor = (type: string) => [
    ...(secrets.data ?? [])
      .filter((s) => s.kind !== "invalid")
      .map((s) => ({ value: `secret:${s.name}`, label: `Secret: ${s.name}` })),
    ...(variables.data ?? []).map((v) => ({
      value: `variable:${v.name}`,
      label: `Variable: ${v.name} (${v.type})`,
      disabled: v.type !== type,
    })),
  ];

  return (
    <>
      <Hint>
        Take external variables from a stored secret or variable instead of
        typing them at every run. Leave the version empty to always use the
        latest one.
      </Hint>
      <MappingList>
        {externals.map(([ref, variable]) => (
          <MappingItem key={ref}>
            <ItemHeader>
              <span>
                {ref} <Hint as="span">{variable.type}</Hint>
              </span>
              <StatusBadge resolved={resolved.get(ref)} />
            </ItemHeader>
            <SourceRow>
              <Select
                $size={ThemeSize.Small}
                aria-label={`Source for ${ref}`}
                $value={draft[ref]?.source ?? ""}
                $onChange={(source) => update(ref, { source, version: "" })}
                $placeholder="Ask at run time"
                $options={optionsFor(variable.type)}
                disabled={!canWrite || save.isPending}
              />
              <Input
                $size={ThemeSize.Small}
                type="number"
                min={1}
                step={1}
                placeholder="latest"
                aria-label={`Pinned version for ${ref}`}
                value={draft[ref]?.version ?? ""}
                onChange={(e) => update(ref, { version: e.target.value })}
                disabled={!canWrite || save.isPending || !draft[ref]?.source}
              />
            </SourceRow>
          </MappingItem>
        ))}
      </MappingList>
      {canWrite && (
        <Actions>
          <Button
            $size={ThemeSize.Small}
            $variant={ThemeVariant.Primary}
            disabled={!changed || save.isPending}
            onClick={() => save.mutate()}
          >
            Save mapping
          </Button>
          <Button
            $size={ThemeSize.Small}
            $variant={ThemeVariant.Primary}
            $ghost
            disabled={!changed || save.isPending}
            onClick={() => setDraft(toDraft(mapping))}
          >
            Undo changes
          </Button>
        </Actions>
      )}
    </>
  );
};

/** Links the external playbook variables to stored secrets and variables. */
export const PlaybookMappingPanel = ({ playbook }: { playbook: Playbook }) => {
  const { data, isLoading, isError, error } = useQuery(
    storeQueries.mapping(playbook.id),
  );

  return (
    <div>
      <SectionTitle>External variables</SectionTitle>
      {isLoading && <Spinner />}
      {isError && (
        <Text>
          {getErrorFromApiResponse(error).message ||
            "Could not load the mapping"}
        </Text>
      )}
      {!isLoading && !isError && (
        // Remount after a save so the form starts from the stored mapping.
        <MappingForm
          key={data?.version ?? 0}
          playbook={playbook}
          mapping={data ?? null}
        />
      )}
    </div>
  );
};
