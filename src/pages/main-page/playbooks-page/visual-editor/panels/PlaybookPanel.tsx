import { useId } from "react";

import { Badge, FormGroup, FormLabel, Select, ThemeSize } from "@/components";
import type { Playbook } from "@/types";

import type { EditPlaybook } from "../model/editor";
import {
  getExtraFields,
  getOwnedPlaybookKeys,
  setExtraFields,
  setField,
} from "../model/fields";
import { getAllIssues, PLAYBOOK_OWNER } from "../model/rules";
import {
  PLAYBOOK_TABS,
  SUPPORTED_SPEC_VERSIONS,
  type CacaoSpec,
  type PanelTab,
} from "../model/specs";
import { FieldInput } from "./FieldInput";
import { IssueNotices } from "./IssueNotices";
import { JsonFieldsEditor } from "./JsonFieldsEditor";
import { Hint, PanelBody, PanelTabContent, SpecBadgeRow } from "./Panel.styles";
import { PanelFormContext } from "./panelForm";
import { PanelTabs } from "./PanelTabs";

type PlaybookPanelProps = {
  playbook: Playbook;
  spec: CacaoSpec;
  edit: EditPlaybook;
  activeTab: PanelTab | undefined;
  onSelectTab: (tab: PanelTab) => void;
  /** Only for a new playbook: an existing one keeps its CACAO version. */
  onChangeSpec?: (version: string) => void;
};

const SpecVersionField: React.FC<{
  version: string;
  onChange?: (version: string) => void;
}> = ({ version, onChange }) => {
  const id = useId();
  if (!onChange) {
    return (
      <SpecBadgeRow>
        <Hint>CACAO version</Hint>
        <Badge>{version}</Badge>
      </SpecBadgeRow>
    );
  }
  return (
    <FormGroup>
      <FormLabel htmlFor={id}>CACAO version</FormLabel>
      <Select
        id={id}
        $size={ThemeSize.Small}
        $value={version}
        $onChange={onChange}
        $options={SUPPORTED_SPEC_VERSIONS.map((value) => ({ value, label: value }))}
      />
    </FormGroup>
  );
};

/** Shown when no step is selected. */
export const PlaybookPanel: React.FC<PlaybookPanelProps> = ({
  playbook,
  spec,
  edit,
  activeTab,
  onSelectTab,
  onChangeSpec,
}) => {
  const issues = getAllIssues(playbook, spec).filter(
    (issue) => issue.ownerId === PLAYBOOK_OWNER,
  );
  const playbookProblems = issues.filter((issue) => !issue.field);
  const tab = PLAYBOOK_TABS.find((candidate) => candidate === activeTab) ?? "metadata";
  const owned = getOwnedPlaybookKeys(spec);

  return (
    <PanelFormContext
      value={{ playbook, ownerId: PLAYBOOK_OWNER, tab, issues }}
    >
      <PanelBody>
        <Hint>Select a step to edit it, or drag a new step onto the canvas.</Hint>
        <IssueNotices issues={playbookProblems} />

        <PanelTabs tabs={PLAYBOOK_TABS} onSelectTab={onSelectTab} />

        <PanelTabContent>
          <div>
            {tab === "metadata" && (
              <SpecVersionField version={spec.version} onChange={onChangeSpec} />
            )}
            {spec.playbookFields
              .filter((field) => field.tab === tab)
              .map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={playbook[field.key]}
                  path={field.key}
                  onChange={(value) => edit((p) => setField(p, field.key, value))}
                />
              ))}
          </div>

          {tab === "advanced" && (
            <JsonFieldsEditor
              label="Other fields"
              hint="Other playbook fields, as JSON. SOARCA keeps only CACAO 2.0 fields and drops the rest when you save."
              path="advanced"
              value={getExtraFields(playbook, owned)}
              onChange={(extra) => edit((p) => setExtraFields(p, owned, extra))}
            />
          )}
        </PanelTabContent>
      </PanelBody>
    </PanelFormContext>
  );
};
