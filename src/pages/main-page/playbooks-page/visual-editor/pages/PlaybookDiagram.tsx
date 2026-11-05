import { ReactFlowProvider } from "@xyflow/react";

import type { Playbook } from "@/types";

import { FlowCanvas } from "../canvas/FlowCanvas";
import { getSpec } from "../model/specs";
import { UnsupportedSpec } from "./UnsupportedSpec";

type PlaybookDiagramProps = {
  playbook: Playbook;
  selectedStepId?: string;
  onSelectStep?: (stepId: string | undefined) => void;
};

/** Read-only diagram of a playbook, for the detail page. */
export const PlaybookDiagram: React.FC<PlaybookDiagramProps> = ({
  playbook,
  selectedStepId,
  onSelectStep,
}) => {
  const spec = getSpec(playbook.spec_version);
  if (!spec) return <UnsupportedSpec version={playbook.spec_version} />;

  return (
    <ReactFlowProvider>
      <FlowCanvas
        playbook={playbook}
        spec={spec}
        selectedStepId={selectedStepId}
        onSelectStep={onSelectStep}
      />
    </ReactFlowProvider>
  );
};
