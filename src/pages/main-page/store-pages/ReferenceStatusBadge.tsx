import type { PropsWithChildren } from "react";

import { Badge, ThemeVariant } from "@/components";
import type { ReferenceStatus } from "@/types";

export const STATUS_LABELS: Record<ReferenceStatus, string> = {
  ok: "OK",
  missing: "Missing",
  deleted: "Deleted",
  destroyed: "Destroyed",
  invalid: "Invalid",
  type_mismatch: "Type mismatch",
};

const STATUS_HINTS: Record<ReferenceStatus, string> = {
  ok: "The value can be read.",
  missing: "The source or the pinned version does not exist.",
  deleted: "This version was deleted. It can still be restored in OpenBao.",
  destroyed: "This version was destroyed and cannot be restored.",
  invalid: "SOARCA cannot read this secret.",
  type_mismatch: "The source type does not fit the playbook variable type.",
};

const STATUS_VARIANTS: Record<ReferenceStatus, ThemeVariant> = {
  ok: ThemeVariant.Success,
  missing: ThemeVariant.Error,
  deleted: ThemeVariant.Warning,
  destroyed: ThemeVariant.Error,
  invalid: ThemeVariant.Error,
  type_mismatch: ThemeVariant.Warning,
};

/** Colours a mapped source by whether SOARCA can read it. Shows the status unless given other text. */
export const ReferenceStatusBadge = ({
  status,
  children = STATUS_LABELS[status],
}: PropsWithChildren<{ status: ReferenceStatus }>) => (
  <Badge $variant={STATUS_VARIANTS[status]} title={STATUS_HINTS[status]}>
    {children}
  </Badge>
);
