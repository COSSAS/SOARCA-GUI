import { ReactFlowProvider } from "@xyflow/react";

import type { Playbook } from "@/types";

import { FlowCanvas } from "../canvas/FlowCanvas";
import { getSpec } from "../model/specs";
import { UnsupportedSpec } from "./UnsupportedSpec";

/** Read-only diagram of a playbook, for the detail page. */
export const PlaybookDiagram: React.FC<{ playbook: Playbook }> = ({
  playbook,
}) => {
  const spec = getSpec(playbook.spec_version);
  if (!spec) return <UnsupportedSpec version={playbook.spec_version} />;

  return (
    <ReactFlowProvider>
      <FlowCanvas playbook={playbook} spec={spec} />
    </ReactFlowProvider>
  );
};
