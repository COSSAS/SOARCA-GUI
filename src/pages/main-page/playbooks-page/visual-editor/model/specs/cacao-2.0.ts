import {
  IconArrowsSplit,
  IconArrowsSplit2,
  IconBolt,
  IconBook,
  IconGitBranch,
  IconPlayerPlay,
  IconPlayerStop,
  IconRepeat,
} from "@tabler/icons-react";

import { ThemeVariant } from "@/components/utils";

import type { CacaoSpec, Field, StepField } from "./types";

// Open vocabulary from the spec. These are suggestions: other values are allowed.
const AGENT_TARGET_TYPES = [
  "group",
  "individual",
  "location",
  "organization",
  "sector",
  "http-api",
  "linux",
  "net-address",
  "security-category",
  "ssh",
];

const variableEntry: Field[] = [
  {
    key: "type",
    label: "Type",
    kind: "text",
    required: true,
    vocabulary: [
      "bool",
      "dictionary",
      "float",
      "hexstring",
      "integer",
      "ipv4-addr",
      "ipv6-addr",
      "long",
      "mac-addr",
      "hash",
      "md5-hash",
      "sha256-hash",
      "string",
      "uri",
      "uuid",
    ],
  },
  { key: "value", label: "Value", kind: "variable-value" },
  { key: "description", label: "Description", kind: "text" },
  { key: "constant", label: "Constant", kind: "boolean" },
  { key: "external", label: "External", kind: "boolean" },
];

const variables = <K extends "step_variables" | "playbook_variables">(key: K) =>
  ({
    key,
    label: "Variables",
    kind: "entries",
    entry: variableEntry,
    itemLabel: "variable",
    newEntry: { id: "variable", defaults: { type: "string" } },
  }) as const;

const argList = (key: "in_args" | "out_args", label: string): StepField => ({
  key,
  label,
  kind: "list",
  source: "variables",
  tab: "variables",
});

const agentEntry: Field[] = [
  {
    key: "name",
    label: "Capability",
    kind: "text",
    required: true,
    source: "capabilities",
  },
  {
    key: "type",
    label: "Type",
    kind: "text",
    required: true,
    source: "agentTypes",
  },
  { key: "description", label: "Description", kind: "text" },
];

const targetEntry: Field[] = [
  { key: "name", label: "Name", kind: "text", required: true },
  {
    key: "type",
    label: "Type",
    kind: "text",
    required: true,
    vocabulary: AGENT_TARGET_TYPES,
  },
  { key: "description", label: "Description", kind: "text" },
  {
    key: "address",
    label: "Address",
    kind: "address",
    requiredForTypes: ["http-api", "linux", "net-address", "ssh"],
  },
  {
    key: "authentication_info",
    label: "Authentication",
    kind: "reference",
    source: "auth",
  },
  { key: "port", label: "Port", kind: "text" },
];

/** Command types that send a request body and headers. */
const HTTP_COMMAND_TYPES = ["http-api", "openc2-http"];

/**
 * CACAO 2.0, based on the OASIS spec and the JSON schemas in the CACAO roaster
 * (lib/cacao-json-schemas/schemas/workflows).
 * Fields that are not listed are edited as JSON in the advanced tab.
 */
export const cacao20: CacaoSpec = {
  version: "cacao-2.0",
  commonFields: [
    { key: "name", label: "Name", kind: "text", tab: "details" },
    {
      key: "description",
      label: "Description",
      kind: "textarea",
      tab: "details",
    },
    {
      key: "delay",
      label: "Delay (ms)",
      kind: "number",
      min: 1,
      tab: "execution",
    },
    {
      key: "timeout",
      label: "Timeout (ms)",
      kind: "number",
      min: 0,
      tab: "execution",
    },
    { key: "owner", label: "Owner", kind: "text", tab: "execution" },
    { ...variables("step_variables"), tab: "variables" },
  ],
  protectedPlaybookKeys: [
    "type",
    "spec_version",
    "id",
    "created_by",
    "created",
    "modified",
    "workflow",
    "workflow_start",
  ],
  playbookFields: [
    {
      key: "name",
      label: "Name",
      kind: "text",
      required: true,
      tab: "metadata",
    },
    {
      key: "description",
      label: "Description",
      kind: "textarea",
      tab: "metadata",
    },
    {
      key: "playbook_types",
      label: "Playbook types",
      kind: "list",
      tab: "metadata",
      vocabulary: [
        "attack",
        "detection",
        "engagement",
        "investigation",
        "mitigation",
        "notification",
        "prevention",
        "remediation",
      ],
    },
    {
      key: "playbook_activities",
      label: "Playbook activities",
      kind: "list",
      tab: "metadata",
      vocabulary: [
        "analyze-collected-data",
        "compose-content",
        "configure-systems",
        "deliver-content",
        "disconnect-system",
        "eliminate-risk",
        "identify-audience",
        "identify-channel",
        "identify-indicators",
        "identify-steps",
        "map-network",
        "match-indicator",
        "restore-capabilities",
        "restore-data",
        "restrict-access",
        "revert-system",
        "scan-system",
        "scan-vulnerabilities",
      ],
    },
    { key: "labels", label: "Labels", kind: "list", tab: "metadata" },
    {
      key: "priority",
      label: "Priority (0-100)",
      kind: "number",
      min: 0,
      max: 100,
      tab: "metadata",
    },
    {
      key: "severity",
      label: "Severity (0-100)",
      kind: "number",
      min: 0,
      max: 100,
      tab: "metadata",
    },
    {
      key: "impact",
      label: "Impact (0-100)",
      kind: "number",
      min: 0,
      max: 100,
      tab: "metadata",
    },
    {
      key: "valid_from",
      label: "Valid from",
      kind: "timestamp",
      tab: "metadata",
    },
    {
      key: "valid_until",
      label: "Valid until",
      kind: "timestamp",
      tab: "metadata",
    },
    { ...variables("playbook_variables"), tab: "resources" },
    {
      key: "agent_definitions",
      label: "Agents",
      kind: "entries",
      tab: "resources",
      entry: agentEntry,
      itemLabel: "agent",
      newEntry: {
        id: "typed-id",
        defaults: { type: "soarca", name: "soarca-manual" },
      },
    },
    {
      key: "target_definitions",
      label: "Targets",
      kind: "entries",
      tab: "resources",
      entry: targetEntry,
      itemLabel: "target",
      newEntry: { id: "typed-id", defaults: { type: "net-address" } },
    },
    {
      key: "authentication_info_definitions",
      label: "Authentication",
      kind: "entries",
      tab: "resources",
      entry: [
        { key: "name", label: "Name", kind: "text" },
        {
          key: "type",
          label: "Type",
          kind: "text",
          required: true,
          vocabulary: ["http-basic", "oauth2", "private-key", "user-auth"],
        },
        { key: "description", label: "Description", kind: "text" },
        { key: "username", label: "Username", kind: "text" },
        { key: "kms", label: "Secret is in a KMS", kind: "boolean" },
      ],
      itemLabel: "authentication",
      newEntry: { id: "typed-id", defaults: { type: "user-auth" } },
    },
    {
      key: "workflow_exception",
      label: "Exception step",
      kind: "reference",
      source: "steps",
      tab: "advanced",
    },
  ],
  conflicts: {
    on_completion: ["on_success", "on_failure"],
    on_success: ["on_completion"],
    on_failure: ["on_completion"],
  },
  stepTypes: {
    start: {
      label: "Start",
      color: ThemeVariant.Success,
      icon: IconPlayerPlay,
      connections: ["on_completion"],
      fields: [],
    },
    end: {
      label: "End",
      color: ThemeVariant.Error,
      icon: IconPlayerStop,
      connections: [],
      fields: [],
    },
    action: {
      label: "Action",
      color: ThemeVariant.Primary,
      icon: IconBolt,
      connections: ["on_completion", "on_success", "on_failure"],
      fields: [
        {
          key: "agent",
          label: "Agent",
          kind: "reference",
          source: "agents",
          required: true,
          tab: "details",
        },
        {
          key: "commands",
          label: "Commands",
          kind: "items",
          required: true,
          tab: "details",
          itemLabel: "command",
          newEntry: { defaults: { type: "manual" } },
          entry: [
            {
              key: "type",
              label: "Type",
              kind: "text",
              required: true,
              source: "commandTypes",
            },
            {
              key: "command",
              label: "Command",
              kind: "textarea",
              required: true,
            },
            {
              key: "content",
              label: "Body",
              kind: "textarea",
              forTypes: HTTP_COMMAND_TYPES,
            },
            {
              key: "headers",
              label: "Headers",
              kind: "headers",
              forTypes: HTTP_COMMAND_TYPES,
            },
            { key: "description", label: "Description", kind: "text" },
          ],
        },
        {
          key: "targets",
          label: "Targets",
          kind: "list",
          source: "targets",
          tab: "execution",
        },
        argList("in_args", "Input variables"),
        argList("out_args", "Output variables"),
      ],
    },
    "playbook-action": {
      label: "Playbook action",
      color: "cyan",
      icon: IconBook,
      connections: ["on_completion", "on_success", "on_failure"],
      fields: [
        {
          key: "playbook_id",
          label: "Playbook ID",
          kind: "text",
          required: true,
          tab: "details",
        },
        {
          key: "playbook_version",
          label: "Playbook version",
          kind: "timestamp",
          tab: "details",
        },
        argList("in_args", "Input variables"),
        argList("out_args", "Output variables"),
      ],
    },
    "if-condition": {
      label: "If condition",
      color: ThemeVariant.Warning,
      icon: IconGitBranch,
      connections: [
        "on_true",
        "on_false",
        "on_completion",
        "on_success",
        "on_failure",
      ],
      minLinks: { on_true: 1 },
      fields: [
        {
          key: "condition",
          label: "Condition",
          kind: "text",
          required: true,
          tab: "details",
        },
      ],
    },
    "while-condition": {
      label: "While condition",
      color: "magenta",
      icon: IconRepeat,
      connections: ["on_true", "on_completion", "on_success", "on_failure"],
      minLinks: { on_true: 1 },
      fields: [
        {
          key: "condition",
          label: "Condition",
          kind: "text",
          required: true,
          tab: "details",
        },
      ],
    },
    "switch-condition": {
      label: "Switch condition",
      color: "orange",
      icon: IconArrowsSplit,
      connections: ["cases", "on_completion", "on_success", "on_failure"],
      minLinks: { cases: 1 },
      fields: [
        {
          key: "switch",
          label: "Switch on",
          kind: "switch",
          required: true,
          tab: "details",
        },
      ],
    },
    parallel: {
      label: "Parallel",
      color: ThemeVariant.Accent,
      icon: IconArrowsSplit2,
      connections: ["next_steps", "on_completion", "on_success", "on_failure"],
      minLinks: { next_steps: 2 },
      fields: [],
    },
  },
};
