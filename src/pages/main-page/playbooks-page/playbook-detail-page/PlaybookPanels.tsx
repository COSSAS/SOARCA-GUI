import { lazy, useState } from "react";

import { Tabs, TabsProvider, ThemeSize, useTabs } from "@/components";
import type { Playbook } from "@/types";

import { CollapsibleSidePanel } from "../visual-editor/panels/CollapsibleSidePanel";
import { PanelBody, PanelTabBar, PanelTabContent } from "../visual-editor/panels/Panel.styles";
import { DetailBody, DiagramFrame } from "./PlaybookDetailPage.styles";
import {
  PlaybookDescription,
  PlaybookOverview,
  PlaybookReferences,
} from "./PlaybookDetails";
import { StepDetails } from "./StepDetails";

// Loaded on demand because it pulls in React Flow.
const PlaybookDiagram = lazy(() =>
  import("../visual-editor/pages/PlaybookDiagram").then((m) => ({
    default: m.PlaybookDiagram,
  })),
);

const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "description", label: "Description" },
  { id: "references", label: "References" },
];

const DetailTabContent = ({ playbook }: { playbook: Playbook }) => {
  const { activeTab } = useTabs();
  if (activeTab === "description") return <PlaybookDescription playbook={playbook} />;
  if (activeTab === "references") return <PlaybookReferences playbook={playbook} />;
  return <PlaybookOverview playbook={playbook} />;
};

/** Step details, diagram and playbook details. Starts with the start step selected. */
export const PlaybookPanels = ({ playbook }: { playbook: Playbook }) => {
  const [stepCollapsed, setStepCollapsed] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(
    playbook.workflow_start,
  );

  // Selecting a step opens its panel; clearing the selection leaves the panel as it is.
  const selectStep = (stepId: string | undefined) => {
    setSelectedStepId(stepId);
    if (stepId) setStepCollapsed(false);
  };

  return (
    <DetailBody $stepCollapsed={stepCollapsed} $detailsCollapsed={detailsCollapsed}>
      <CollapsibleSidePanel
        side="left"
        wide
        label="step details"
        title="Step details"
        collapsed={stepCollapsed}
        onToggle={() => setStepCollapsed(!stepCollapsed)}
      >
        <StepDetails playbook={playbook} stepId={selectedStepId} />
      </CollapsibleSidePanel>
      <DiagramFrame>
        <PlaybookDiagram
          playbook={playbook}
          selectedStepId={selectedStepId}
          onSelectStep={selectStep}
        />
      </DiagramFrame>
      <CollapsibleSidePanel
        side="right"
        label="playbook details"
        title="Playbook details"
        collapsed={detailsCollapsed}
        onToggle={() => setDetailsCollapsed(!detailsCollapsed)}
      >
        <TabsProvider $initialTab="overview">
          <PanelBody>
            <PanelTabBar>
              <Tabs $size={ThemeSize.Small} $tabs={DETAIL_TABS} />
            </PanelTabBar>
            <PanelTabContent>
              <DetailTabContent playbook={playbook} />
            </PanelTabContent>
          </PanelBody>
        </TabsProvider>
      </CollapsibleSidePanel>
    </DetailBody>
  );
};
