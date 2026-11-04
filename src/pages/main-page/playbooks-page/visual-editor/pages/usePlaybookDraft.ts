import { useState } from "react";

import type { Playbook } from "@/types";

import { setPositions } from "../model/coordinates";
import type { EditPlaybook } from "../model/editor";
import { getPositions } from "../model/layout";
import type { CacaoSpec } from "../model/specs";

/**
 * Holds the playbook being edited. Every step gets a stored position when the
 * editor opens, so the auto layout never moves steps the user already sees.
 */
export const usePlaybookDraft = (initial: Playbook, spec: CacaoSpec) => {
  const [original] = useState(() =>
    setPositions(initial, getPositions(initial, spec)),
  );
  const [playbook, setPlaybook] = useState(original);
  const edit: EditPlaybook = setPlaybook;

  return { playbook, hasChanges: playbook !== original, edit };
};
