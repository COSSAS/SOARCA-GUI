import { createContext, useContext } from "react";

import type { SearchSelectOption } from "@/components";
import type { Playbook, Step } from "@/types";

import type { Issue } from "../model/rules";
import { getReferenceOptions } from "../model/references";
import type { PanelTab, ReferenceSource } from "../model/specs";

/** What the inputs of one properties panel share. */
export type PanelForm = {
  playbook: Playbook;
  /** Undefined in the playbook panel. */
  step?: Step;
  /** Step id, or PLAYBOOK_OWNER. */
  ownerId: string;
  tab: PanelTab;
  issues: Issue[];
};

export const PanelFormContext = createContext<PanelForm | undefined>(undefined);

export const usePanelForm = (): PanelForm => {
  const form = useContext(PanelFormContext);
  if (!form)
    throw new Error("usePanelForm must be used inside a PanelFormContext");
  return form;
};

/** The issue of one field, by its path. */
export const usePanelIssue = (path: string): Issue | undefined =>
  usePanelForm().issues.find((issue) => issue.field === path);

/** The issues of the fields inside an entry, e.g. all under "agent_definitions.soarca--1". */
export const useEntryIssues = (path: string): Issue[] =>
  usePanelForm().issues.filter((issue) => issue.field?.startsWith(`${path}.`));

/**
 * Options for a reference input. They come from the playbook and soarca.ts for
 * now. When the backend can list agents, variables and secrets, fetch them here
 * with useQuery and add them to the result, so every reference input gets them.
 */
export const useReferenceOptions = (
  source: ReferenceSource | undefined,
): SearchSelectOption[] => {
  const { playbook, step } = usePanelForm();
  return source ? getReferenceOptions(playbook, source, step) : [];
};
