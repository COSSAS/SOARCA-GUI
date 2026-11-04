import { IconTrash } from "@tabler/icons-react";
import type { Ref } from "react";

import { Button, Icon, ThemeSize, ThemeVariant } from "@/components";
import type { Playbook } from "@/types";

import { UNKNOWN_STEP_COLOR, UNKNOWN_STEP_ICON } from "../canvas/constants";
import { StepIcon } from "../canvas/StepIcon";
import type { EditPlaybook } from "../model/editor";
import { removeSteps } from "../model/edits";
import type { CacaoSpec, PanelTab } from "../model/specs";
import { CollapsibleSidePanel } from "./CollapsibleSidePanel";
import { ItemButton, SelectionList } from "./Panel.styles";
import { PlaybookPanel } from "./PlaybookPanel";
import { StepPanel } from "./StepPanel";

type PropertiesPanelProps = {
  playbook: Playbook;
  spec: CacaoSpec;
  selectedIds: string[];
  edit: EditPlaybook;
  onSelect: (ids: string[]) => void;
  collapsed: boolean;
  onToggle: () => void;
  activeTab: PanelTab | undefined;
  onSelectTab: (tab: PanelTab) => void;
  onChangeSpec?: (version: string) => void;
  ref?: Ref<HTMLElement>;
};

/** Right side panel: the selected step, the multi-selection, or the playbook itself. */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  playbook,
  spec,
  selectedIds,
  edit,
  onSelect,
  collapsed,
  onToggle,
  activeTab,
  onSelectTab,
  onChangeSpec,
  ref,
}) => {
  const panel = { side: "right", label: "properties", collapsed, onToggle, ref } as const;
  const tabs = { activeTab, onSelectTab };

  if (selectedIds.length > 1)
    return (
      <CollapsibleSidePanel
        {...panel}
        title={`${selectedIds.length} steps selected`}
      >
        <SelectionList>
          {selectedIds.map((id) => (
            <ItemButton key={id} onClick={() => onSelect([id])}>
              {playbook.workflow[id]?.name || id}
            </ItemButton>
          ))}
        </SelectionList>
      </CollapsibleSidePanel>
    );

  if (selectedIds.length === 1) {
    const [stepId] = selectedIds;
    const step = playbook.workflow[stepId];
    const definition = spec.stepTypes[step.type];
    return (
      <CollapsibleSidePanel
        {...panel}
        title={
          <>
            <StepIcon
              icon={definition?.icon ?? UNKNOWN_STEP_ICON}
              $color={definition?.color ?? UNKNOWN_STEP_COLOR}
            />
            {definition?.label ?? step.type}
          </>
        }
        actions={
          <Button
            $variant={ThemeVariant.Error}
            $size={ThemeSize.Small}
            $ghost
            onClick={() => edit((p) => removeSteps(p, [stepId]))}
          >
            <Icon $icon={IconTrash} $size={ThemeSize.Small} />
            Delete
          </Button>
        }
      >
        <StepPanel
          playbook={playbook}
          spec={spec}
          stepId={stepId}
          edit={edit}
          {...tabs}
        />
      </CollapsibleSidePanel>
    );
  }

  return (
    <CollapsibleSidePanel {...panel} title="Playbook">
      <PlaybookPanel
        playbook={playbook}
        spec={spec}
        edit={edit}
        onChangeSpec={onChangeSpec}
        {...tabs}
      />
    </CollapsibleSidePanel>
  );
};