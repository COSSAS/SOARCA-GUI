import { lazy, useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import { Permissions } from "@/auth/permissions";
import { Tabs, TabsProvider, ThemeSize, useTabs } from "@/components";
import type { Playbook } from "@/types";

import { CollapsibleSidePanel } from "../visual-editor/panels/CollapsibleSidePanel";
import { PanelTabContent } from "../visual-editor/panels/PanelTabs";
import {
  PanelBody,
  PanelHeader,
  PanelTabBar,
} from "../visual-editor/panels/Panel.styles";
import { DetailBody, DiagramFrame } from "./PlaybookDetailPage.styles";
import {
  PlaybookDescription,
  PlaybookOverview,
  PlaybookReferences,
} from "./PlaybookDetails";
import { PlaybookMappingPanel } from "./PlaybookMapping";
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

const MAPPING_TAB = { id: "mapping", label: "Mapping" };

const DetailTabContent = ({ playbook }: { playbook: Playbook }) => {
  const { activeTab } = useTabs();
  if (activeTab === "description")
    return <PlaybookDescription playbook={playbook} />;
  if (activeTab === "references")
    return <PlaybookReferences playbook={playbook} />;
  if (activeTab === "mapping")
    return <PlaybookMappingPanel playbook={playbook} />;
  return <PlaybookOverview playbook={playbook} />;
};

/** Step details, diagram and playbook details. Starts with the start step selected. */
export const PlaybookPanels = ({ playbook }: { playbook: Playbook }) => {
  const { can } = useAuth();
  const showMapping =
    can(Permissions.MappingRead) &&
    Object.values(playbook.playbook_variables ?? {}).some(
      (v) => v.external === true,
    );
  const tabs = showMapping ? [...DETAIL_TABS, MAPPING_TAB] : DETAIL_TABS;
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
    <DetailBody
      $stepCollapsed={stepCollapsed}
      $detailsCollapsed={detailsCollapsed}
    >
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
        tabbed
        collapsed={detailsCollapsed}
        onToggle={() => setDetailsCollapsed(!detailsCollapsed)}
      >
        <TabsProvider $initialTab="overview">
          <PanelBody>
            <PanelHeader>
              <PanelTabBar>
                <Tabs $size={ThemeSize.Small} $tabs={tabs} />
              </PanelTabBar>
            </PanelHeader>
            <PanelTabContent>
              <DetailTabContent playbook={playbook} />
            </PanelTabContent>
          </PanelBody>
        </TabsProvider>
      </CollapsibleSidePanel>
    </DetailBody>
  );
};
