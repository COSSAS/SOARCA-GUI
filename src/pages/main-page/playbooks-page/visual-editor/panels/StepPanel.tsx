import { useState } from "react";

import { FormGroup, Input, ThemeSize } from "@/components";
import type { Playbook } from "@/types";

import type { EditPlaybook } from "../model/editor";
import { renameCase, updateStep } from "../model/edits";
import {
  getExtraStepFields,
  getOwnedStepKeys,
  getStepFields,
  setExtraStepFields,
  setField,
} from "../model/fields";
import { getStepIssues } from "../model/rules";
import { STEP_TABS, type CacaoSpec, type PanelTab } from "../model/specs";
import { FieldInput } from "./FieldInput";
import { JsonFieldsEditor } from "./JsonFieldsEditor";
import { Hint, PanelBody, PanelTabContent, ProblemList, SectionTitle } from "./Panel.styles";
import { PanelFormContext } from "./panelForm";
import { PanelTabs } from "./PanelTabs";

type StepPanelProps = {
  playbook: Playbook;
  spec: CacaoSpec;
  stepId: string;
  edit: EditPlaybook;
  activeTab: PanelTab | undefined;
  onSelectTab: (tab: PanelTab) => void;
};

type CaseNameInputProps = {
  name: string;
  isTaken: (name: string) => boolean;
  onRename: (name: string) => void;
};

/** Renames on blur. An empty or taken name goes back to the old one. */
const CaseNameInput: React.FC<CaseNameInputProps> = ({ name, isTaken, onRename }) => {
  const [text, setText] = useState(name);
  const commit = () => {
    const next = text.trim();
    if (next && next !== name && !isTaken(next)) onRename(next);
    else setText(name);
  };
  return (
    <Input
      $size={ThemeSize.Small}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
    />
  );
};

export const StepPanel: React.FC<StepPanelProps> = ({
  playbook,
  spec,
  stepId,
  edit,
  activeTab,
  onSelectTab,
}) => {
  const step = playbook.workflow[stepId];
  const definition = spec.stepTypes[step.type];
  const owned = getOwnedStepKeys(spec, definition);
  const issues = getStepIssues(step, definition, spec);
  const stepProblems = issues.filter((issue) => !issue.field);
  const tab = STEP_TABS.find((candidate) => candidate === activeTab) ?? "details";
  const tabFields = getStepFields(spec, definition).filter((field) => field.tab === tab);
  const cases = step.cases;

  return (
    <PanelFormContext value={{ playbook, step, ownerId: stepId, tab, issues }}>
      <PanelBody>
        {stepProblems.length > 0 && (
          <ProblemList>
            {stepProblems.map((issue) => (
              <li key={issue.message}>{issue.message}</li>
            ))}
          </ProblemList>
        )}

        <PanelTabs tabs={STEP_TABS} onSelectTab={onSelectTab} />

        <PanelTabContent>
          {tabFields.length > 0 && (
            <div>
              {tabFields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={step[field.key]}
                  path={field.key}
                  onChange={(value) =>
                    edit((p) =>
                      updateStep(
                        p,
                        stepId,
                        setField(p.workflow[stepId], field.key, value),
                      ),
                    )
                  }
                />
              ))}
            </div>
          )}

          {tab === "details" && cases && (
            <div>
              <SectionTitle>Cases</SectionTitle>
              <Hint>Rename a case here. Drag from "+ case" to add one.</Hint>
              {Object.keys(cases).map((key) => (
                <FormGroup key={key}>
                  <CaseNameInput
                    name={key}
                    isTaken={(name) => name in cases}
                    onRename={(name) => edit((p) => renameCase(p, stepId, key, name))}
                  />
                </FormGroup>
              ))}
            </div>
          )}

          {tab === "advanced" && (
            <JsonFieldsEditor
              label="Other fields"
              hint="Other step fields, as JSON."
              path="advanced"
              value={getExtraStepFields(step, owned)}
              onChange={(extra) =>
                edit((p) =>
                  updateStep(
                    p,
                    stepId,
                    setExtraStepFields(p.workflow[stepId], owned, extra),
                  ),
                )
              }
            />
          )}
        </PanelTabContent>
      </PanelBody>
    </PanelFormContext>
  );
};
