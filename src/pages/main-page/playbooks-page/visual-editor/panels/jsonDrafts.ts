import { createContext, useContext, useState } from "react";

import type { Playbook } from "@/types";

import type { PanelTab } from "../model/specs";
import { PLAYBOOK_OWNER } from "../model/rules";

/**
 * Text typed in a JSON box. It is kept here, not in the box, so invalid JSON
 * survives switching tabs or steps and can block saving.
 */
export type JsonDraft = {
  ownerId: string;
  tab: PanelTab;
  text: string;
  error?: string;
};

type JsonDraftsState = {
  drafts: Record<string, JsonDraft>;
  setDraft: (id: string, draft: JsonDraft) => void;
};

export const JsonDraftsContext = createContext<JsonDraftsState | undefined>(undefined);

export const useJsonDrafts = (): JsonDraftsState => {
  const state = useContext(JsonDraftsContext);
  if (!state) throw new Error("useJsonDrafts must be used inside a JsonDraftsContext");
  return state;
};

export const useJsonDraftsState = (): JsonDraftsState => {
  const [drafts, setDrafts] = useState<Record<string, JsonDraft>>({});
  return {
    drafts,
    setDraft: (id, draft) => setDrafts((current) => ({ ...current, [id]: draft })),
  };
};

/** Drafts with invalid JSON whose step or playbook still exists. */
export const getInvalidDrafts = (
  drafts: Record<string, JsonDraft>,
  playbook: Playbook,
): JsonDraft[] =>
  Object.values(drafts).filter(
    (draft) =>
      draft.error &&
      (draft.ownerId === PLAYBOOK_OWNER || draft.ownerId in playbook.workflow),
  );
