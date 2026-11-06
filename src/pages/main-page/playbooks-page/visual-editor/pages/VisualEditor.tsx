import { IconLayoutGrid } from "@tabler/icons-react";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Icon, ThemeVariant } from "@/components";
import type { Playbook } from "@/types";

import { validatePlaybookJson } from "../../utils";
import { ANIMATED_FIT_VIEW_OPTIONS } from "../canvas/constants";
import { FlowCanvas } from "../canvas/FlowCanvas";
import { setPositions, type Position } from "../model/coordinates";
import { addStep, connect, duplicateStep, newStepId } from "../model/edits";
import { autoLayout, NODE_GAP, NODE_WIDTH } from "../model/layout";
import {
  canAddStep,
  canConnect,
  findSaveBlocker,
  getAllIssues,
  type Link,
  PLAYBOOK_OWNER,
} from "../model/rules";
import type { CacaoSpec, PanelTab } from "../model/specs";
import { CollapsibleSidePanel } from "../panels/CollapsibleSidePanel";
import {
  getInvalidDrafts,
  JsonDraftsContext,
  useJsonDraftsState,
} from "../panels/jsonDrafts";
import { PropertiesPanel } from "../panels/PropertiesPanel";
import { StepPalette } from "../panels/StepPalette";
import { usePlaybookDraft } from "./usePlaybookDraft";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { EditorLayout, Toolbar, ToolbarTitle } from "./VisualEditor.styles";

type VisualEditorProps = {
  title: string;
  saveLabel: string;
  initial: Playbook;
  spec: CacaoSpec;
  isSaving: boolean;
  onSave: (playbook: Playbook, onSaved: () => void) => void;
  onCancel: () => void;
  /** Only for a new playbook: an existing one keeps its CACAO version. */
  onChangeSpec?: (version: string) => void;
};

const toSize = (measured?: { width?: number; height?: number }) =>
  measured?.width && measured.height
    ? { width: measured.width, height: measured.height }
    : undefined;

const EditorContent: React.FC<VisualEditorProps> = ({
  title,
  saveLabel,
  initial,
  spec,
  isSaving,
  onSave,
  onCancel,
  onChangeSpec,
}) => {
  const { playbook, hasChanges, edit } = usePlaybookDraft(initial, spec);
  const markSaved = useUnsavedChanges(hasChanges);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>();
  const jsonDrafts = useJsonDraftsState();
  const propertiesRef = useRef<HTMLElement>(null);
  const { fitView, getNode, getNodes } = useReactFlow();
  // Stable between edits, so the canvas does not rebuild its nodes on unrelated renders.
  const selected = useMemo(
    () => selectedIds.filter((id) => playbook.workflow[id]),
    [selectedIds, playbook.workflow],
  );
  const issues = getAllIssues(playbook, spec);
  const invalidDrafts = getInvalidDrafts(jsonDrafts.drafts, playbook);
  const errors =
    issues.filter((issue) => issue.blocking).length + invalidDrafts.length;
  const warnings = issues.filter((issue) => !issue.blocking).length;

  const handleAddStep = (
    type: string,
    position: Position,
    from?: Omit<Link, "target">,
  ) => {
    if (!canAddStep(playbook, type)) return;
    const id = newStepId(type);
    const step = { type, name: spec.stepTypes[type]?.label ?? type };
    edit((current) => {
      const withStep = addStep(current, id, step, position);
      if (!from) return withStep;
      const link = { ...from, target: id };
      return canConnect(withStep, spec, link)
        ? connect(withStep, link)
        : current;
    });
    setSelectedIds([id]);
  };

  const handleDuplicateStep = (stepId: string) => {
    const step = playbook.workflow[stepId];
    const node = getNode(stepId);
    if (!step || step.type === "start" || !node) return;

    const id = newStepId(step.type);
    const position = {
      x: node.position.x + (node.measured?.width ?? NODE_WIDTH) + NODE_GAP,
      y: node.position.y,
    };
    edit((p) => duplicateStep(p, stepId, id, crypto.randomUUID(), position));
    setSelectedIds([id]);
  };

  const handleAutoLayout = () => {
    const sizes = Object.fromEntries(
      getNodes().map((node) => [node.id, toSize(node.measured)]),
    );
    edit((p) => setPositions(p, autoLayout(p, spec, sizes)));
    requestAnimationFrame(() => fitView(ANIMATED_FIT_VIEW_OPTIONS));
  };

  const showFirstError = () => {
    const blocker = findSaveBlocker(issues, invalidDrafts);
    if (!blocker) return;
    setSelectedIds(blocker.ownerId === PLAYBOOK_OWNER ? [] : [blocker.ownerId]);
    setActiveTab(blocker.tab);
    setRightCollapsed(false);
    // Wait for the panel to show the tab, then focus the first invalid field or row.
    requestAnimationFrame(() => {
      const target =
        propertiesRef.current?.querySelector<HTMLElement>("[data-invalid]");
      const control = target?.matches("button")
        ? target
        : target?.querySelector<HTMLElement>("input, textarea, select, button");
      control?.focus();
    });
  };

  const handleSave = () => {
    const toSave = { ...playbook, modified: new Date().toISOString() };
    const validation = validatePlaybookJson(JSON.stringify(toSave));
    if (!validation.valid) {
      toast.error(validation.error ?? "Invalid playbook");
      return;
    }
    onSave(toSave, markSaved);
  };

  const handleChangeSpec = (version: string) => {
    edit((current) => ({ ...current, spec_version: version }));
    onChangeSpec?.(version);
  };

  return (
    <JsonDraftsContext value={jsonDrafts}>
      <EditorLayout
        $leftCollapsed={leftCollapsed}
        $rightCollapsed={rightCollapsed}
        inert={isSaving}
      >
        <Toolbar>
          <ToolbarTitle>{title}</ToolbarTitle>
          {errors > 0 && (
            <Badge
              $variant={ThemeVariant.Error}
              $isClickable
              title="SOARCA rejects the playbook until these are fixed. Click to show the first one"
              onClick={showFirstError}
            >
              {errors} {errors === 1 ? "error" : "errors"}
            </Badge>
          )}
          {warnings > 0 && (
            <Badge
              $variant={ThemeVariant.Warning}
              title="Select the playbook or a step to see its warnings"
            >
              {warnings} {warnings === 1 ? "warning" : "warnings"}
            </Badge>
          )}
          <Button
            $variant={ThemeVariant.Primary}
            $ghost
            onClick={handleAutoLayout}
          >
            <Icon $icon={IconLayoutGrid} />
            Auto layout
          </Button>
          <Button
            $variant={ThemeVariant.Primary}
            $ghost
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            $variant={ThemeVariant.Success}
            onClick={handleSave}
            disabled={isSaving || !hasChanges || errors > 0}
          >
            {saveLabel}
          </Button>
        </Toolbar>

        <CollapsibleSidePanel
          side="left"
          label="step palette"
          title="Steps"
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed((collapsed) => !collapsed)}
        >
          <StepPalette
            playbook={playbook}
            spec={spec}
            onAddStep={handleAddStep}
          />
        </CollapsibleSidePanel>

        <FlowCanvas
          playbook={playbook}
          spec={spec}
          editor={{
            edit,
            selectedIds: selected,
            onSelect: setSelectedIds,
            onAddStep: handleAddStep,
            onAutoLayout: handleAutoLayout,
            onDuplicateStep: handleDuplicateStep,
          }}
        />

        <PropertiesPanel
          playbook={playbook}
          spec={spec}
          selectedIds={selected}
          edit={edit}
          onSelect={setSelectedIds}
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed((collapsed) => !collapsed)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onChangeSpec={onChangeSpec && handleChangeSpec}
          ref={propertiesRef}
        />
      </EditorLayout>
    </JsonDraftsContext>
  );
};

/** Visual playbook editor: step palette, diagram and a form for the selected step. */
export const VisualEditor: React.FC<VisualEditorProps> = (props) => (
  <ReactFlowProvider>
    <EditorContent {...props} />
  </ReactFlowProvider>
);
