import { useReactFlow } from "@xyflow/react";

import { Badge, BadgeShape } from "@/components";
import type { Playbook } from "@/types";

import { STEP_TYPE_MIME } from "../canvas/constants";
import { StepIcon } from "../canvas/StepIcon";
import type { Position } from "../model/coordinates";
import { findFreeSpot } from "../model/layout";
import { canAddStep } from "../model/rules";
import type { CacaoSpec } from "../model/specs";
import {
  HelpItem,
  HelpSection,
  Hint,
  PaletteItem,
  PaletteList,
} from "./Panel.styles";

const CONTROLS = [
  ["Click", "Select a step"],
  ["Ctrl or Cmd + click", "Add a step to the selection, or remove it"],
  ["Shift + drag", "Select the steps in an area"],
  ["Drag from a port", "Connect to another step"],
  ["Right-click", "Menu for a step, port, connection or the canvas"],
  ["Delete", "Remove the selected steps or connection"],
  ["Scroll", "Zoom"],
  ["Drag the canvas", "Move around"],
];

type StepPaletteProps = {
  playbook: Playbook;
  spec: CacaoSpec;
  onAddStep: (type: string, position: Position) => void;
};

/** Step types of the spec. Drag one onto the canvas, or click to add it below the last step. */
export const StepPalette: React.FC<StepPaletteProps> = ({
  playbook,
  spec,
  onAddStep,
}) => {
  const { setCenter, getZoom } = useReactFlow();

  const handleClick = (type: string) => {
    const position = findFreeSpot(playbook);
    onAddStep(type, position);
    setCenter(position.x, position.y, {
      zoom: getZoom(),
      duration: 300,
    });
  };

  return (
    <>
      <PaletteList>
        {Object.entries(spec.stepTypes).map(([type, definition]) => (
          <PaletteItem
            key={type}
            draggable
            disabled={!canAddStep(playbook, type)}
            onDragStart={(e) => e.dataTransfer.setData(STEP_TYPE_MIME, type)}
            onClick={() => handleClick(type)}
          >
            <StepIcon icon={definition.icon} $color={definition.color} />
            {definition.label}
          </PaletteItem>
        ))}
      </PaletteList>
      <HelpSection>
        <Hint>Drag a step onto the canvas, or click to add it.</Hint>
        {CONTROLS.map(([keys, action]) => (
          <HelpItem key={keys}>
            <Badge $shape={BadgeShape.Rounded}>{keys}</Badge>
            <Hint>{action}</Hint>
          </HelpItem>
        ))}
      </HelpSection>
    </>
  );
};