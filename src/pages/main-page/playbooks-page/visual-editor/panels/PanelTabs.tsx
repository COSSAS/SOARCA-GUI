import { Tabs, TabsProvider, ThemeSize } from "@/components";

import type { PanelTab } from "../model/specs";
import { getInvalidDrafts, useJsonDrafts } from "./jsonDrafts";
import { IssueCount, PanelTabBar } from "./Panel.styles";
import { usePanelForm } from "./panelForm";

const TAB_LABELS: Record<PanelTab, string> = {
  details: "Details",
  execution: "Execution",
  variables: "Variables",
  advanced: "Advanced",
  metadata: "Metadata",
  resources: "Resources",
};

type PanelTabsProps = {
  tabs: readonly PanelTab[];
  onSelectTab: (tab: PanelTab) => void;
};

/** Tab bar of a properties panel. Each tab shows how many problems it has. */
export const PanelTabs: React.FC<PanelTabsProps> = ({ tabs, onSelectTab }) => {
  const { playbook, ownerId, tab: activeTab, issues } = usePanelForm();
  const { drafts } = useJsonDrafts();
  const invalidDrafts = getInvalidDrafts(drafts, playbook).filter(
    (draft) => draft.ownerId === ownerId,
  );

  const label = (tab: PanelTab) => {
    const tabIssues = issues.filter((issue) => issue.tab === tab);
    const tabDrafts = invalidDrafts.filter((draft) => draft.tab === tab);
    const count = tabIssues.length + tabDrafts.length;
    const blocking = tabDrafts.length > 0 || tabIssues.some((issue) => issue.blocking);
    return (
      <>
        {TAB_LABELS[tab]}
        {count > 0 && <IssueCount $blocking={blocking}>{count}</IssueCount>}
      </>
    );
  };

  const selectTab = (id: string) => {
    const tab = tabs.find((candidate) => candidate === id);
    if (tab) onSelectTab(tab);
  };

  return (
    <TabsProvider $initialTab={activeTab} $activeTab={activeTab} $onSelectTab={selectTab}>
      <PanelTabBar>
        <Tabs
          $size={ThemeSize.Small}
          $tabs={tabs.map((tab) => ({ id: tab, label: label(tab) }))}
        />
      </PanelTabBar>
    </TabsProvider>
  );
};
