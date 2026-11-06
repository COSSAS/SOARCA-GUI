import type { TablerIcon } from "@tabler/icons-react";
import type { ThemeVariant } from "@/components/utils";
import type { Theme } from "@/theme/theme";
import type { Playbook, Step } from "@/types";

/** A theme variant, or one of the extra hues in `theme.colors.hues`. */
export type StepColor = ThemeVariant | keyof Theme["colors"]["hues"];

/** Step fields that point to exactly one other step. */
export type SingleConnection =
  | "on_completion"
  | "on_success"
  | "on_failure"
  | "on_true"
  | "on_false";

/** `cases` and `next_steps` point to many steps, the others to one. */
export type ConnectionKind = SingleConnection | "cases" | "next_steps";

/** Where a reference field gets its options from. */
export type ReferenceSource =
  | "agents"
  | "targets"
  | "auth"
  | "steps"
  | "variables"
  /** What SOARCA can run, see soarca.ts. */
  | "agentTypes"
  | "capabilities"
  | "commandTypes";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  /** RFC 3339 UTC timestamp. */
  | "timestamp"
  /** List of strings, suggested from `vocabulary` or `source`. */
  | "list"
  /** One id picked from `source`. */
  | "reference"
  /** Variable reference, e.g. `__choice__:value`. */
  | "switch"
  /** Object of entries by id, each edited with `entry` fields. */
  | "entries"
  /** Array of entries, each edited with `entry` fields. */
  | "items"
  /** Value of a variable. The input depends on the `type` of the same entry. */
  | "variable-value"
  /** Target address: one address type with its values, e.g. `{ ipv4: ["10.0.0.1"] }`. */
  | "address"
  /** HTTP headers, e.g. `{ Accept: ["application/json"] }`. */
  | "headers";

export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** Required only when the `type` of the same entry is one of these. */
  requiredForTypes?: string[];
  /** Shown only when the `type` of the same entry is one of these. */
  forTypes?: string[];
  /** Limits of a `number` field. */
  min?: number;
  max?: number;
  /** Suggested values of an open vocabulary. Other values are allowed. */
  vocabulary?: string[];
  /** Where the options come from. Only these options can be picked. */
  source?: ReferenceSource;
  /** Fields of one entry for `entries` and `items`. Other entry fields are edited in the advanced tab. */
  entry?: Field[];
  /** Name of one entry in buttons and titles, e.g. "agent". */
  itemLabel?: string;
  /** How "Add" builds a new entry. `id` is only used by `entries`, to turn the typed name into a key. */
  newEntry?: {
    id?: "variable" | "typed-id";
    defaults: Record<string, unknown>;
  };
};

export const STEP_TABS = [
  "details",
  "execution",
  "variables",
  "advanced",
] as const;
export const PLAYBOOK_TABS = ["metadata", "resources", "advanced"] as const;
export type StepTab = (typeof STEP_TABS)[number];
export type PlaybookTab = (typeof PLAYBOOK_TABS)[number];
export type PanelTab = StepTab | PlaybookTab;

export type StepField = Field & { key: keyof Step & string; tab: StepTab };
export type PlaybookField = Field & {
  key: keyof Playbook & string;
  tab: PlaybookTab;
};

export type StepTypeDefinition = {
  label: string;
  color: StepColor;
  icon: TablerIcon;
  /** Outgoing connections, in the order the handles are drawn. */
  connections: ConnectionKind[];
  /** Minimum number of links a connection needs, e.g. parallel needs two next steps. */
  minLinks?: Partial<Record<ConnectionKind, number>>;
  fields: StepField[];
};

/**
 * Everything the editor needs to know about one CACAO version.
 * Add a new file next to cacao-2.0.ts to support another version.
 */
export type CacaoSpec = {
  version: string;
  stepTypes: Record<string, StepTypeDefinition>;
  /** Fields that every step type has. */
  commonFields: StepField[];
  playbookFields: PlaybookField[];
  /**
   * Playbook keys that are generated or edited in the diagram. They are kept on save
   * but not shown in the panel.
   */
  protectedPlaybookKeys: string[];
  /** Connections that cannot be set together on one step. */
  conflicts: Partial<Record<ConnectionKind, ConnectionKind[]>>;
};
