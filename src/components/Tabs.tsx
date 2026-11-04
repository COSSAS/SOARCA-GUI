import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import { TabsContext, TabsContextType, ThemeSize, useTabs } from "./utils";

interface TabOption {
  id: string;
  label: React.ReactNode;
}

export interface TabsProviderProps {
  children: ReactNode;
  $initialTab: string;
  /** Makes the tabs controlled: the parent keeps the active tab. */
  $activeTab?: string;
  $onSelectTab?: (tabId: string) => void;
}

/**
 * Provider component that manages tab state using React Context.
 * Must wrap the Tabs component and any child components that need to access tab state via useTabs hook.
 * Provides activeTab, selectTab, and isActive methods to all descendants through context.
 * @param $initialTab - The id of the tab that should be active on mount. Must match one of the tab ids.
 * @param children - Child components that will have access to tab context. Should include Tabs component and content that responds to tab changes.
 * @example
 * // Basic tabs with provider
 * <TabsProvider $initialTab="overview">
 *   <Tabs $tabs={[
 *     { id: "overview", label: "Overview" },
 *     { id: "details", label: "Details" }
 *   ]} />
 *   <TabContent />
 * </TabsProvider>
 * @example
 * // Using useTabs hook in child components
 * const MyContent = () => {
 *   const { activeTab, isActive } = useTabs();
 *   return <div>{isActive("overview") ? <Overview /> : <Details />}</div>;
 * };
 */
export const TabsProvider: React.FC<TabsProviderProps> = ({
  children,
  $initialTab,
  $activeTab,
  $onSelectTab,
}) => {
  const [ownActiveTab, setOwnActiveTab] = useState($initialTab);
  const activeTab = $activeTab ?? ownActiveTab;

  const value: TabsContextType = {
    activeTab,
    selectTab: (tabId: string) => {
      setOwnActiveTab(tabId);
      $onSelectTab?.(tabId);
    },
    isActive: (tabId: string) => tabId === activeTab,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  $tabs: TabOption[];
  /** Small tabs fit narrow panels. Defaults to Medium. */
  $size?: ThemeSize;
}

const TabsContainer = styled.div<{ $size: ThemeSize }>`
  display: flex;
  gap: ${({ theme, $size }) =>
    $size === ThemeSize.Small ? 0 : theme.spacing.lg};
`;

const TabButton = styled.button<{ $active: boolean; $size: ThemeSize }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  justify-content: center;

  padding: ${({ theme, $size }) =>
    $size === ThemeSize.Small
      ? `${theme.spacing.xs} ${theme.spacing.sm}`
      : `${theme.spacing.sm} ${theme.spacing.md}`};
  border-bottom: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary.main : "transparent"};

  font: ${({ theme, $size }) =>
    $size === ThemeSize.Small
      ? theme.typography.caption.font
      : theme.typography.body.font};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};

  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-bottom-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary.hover : "none"};
    color: ${({ theme, $active }) =>
      $active ? theme.colors.primary.hover : theme.colors.text.primary};
  }
`;

/**
 * Tabs navigation component for switching between different views or sections.
 * Renders a horizontal list of tab buttons with active state.
 * Must be used within a `TabsProvider` to access tab state management.
 * Tab selection is controlled through the `useTabs` context.
 * @param $tabs - Array of tab objects with unique stable id and display label. Each tab requires: { id: string, label: ReactNode }.
 * @example
 * // Simple text tabs
 * <TabsProvider $initialTab="timeline">
 *   <Tabs $tabs={[
 *     { id: "timeline", label: "Timeline" },
 *     { id: "detailed", label: "Detailed View" },
 *     { id: "summary", label: "Summary" }
 *   ]} />
 * </TabsProvider>
 * @example
 * // Tabs with icons
 * <Tabs $tabs={[
 *   { id: "list", label: <><ListIcon /> List</> },
 *   { id: "grid", label: <><GridIcon /> Grid</> }
 * ]} />
 */
export const Tabs: React.FC<TabsProps> = ({
  $tabs,
  $size = ThemeSize.Medium,
  ...rest
}) => {
  const { activeTab, selectTab } = useTabs();

  return (
    <TabsContainer role="tablist" $size={$size} {...rest}>
      {$tabs.map((tab) => (
        <TabButton
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTab}
          $active={tab.id === activeTab}
          $size={$size}
          onClick={() => selectTab(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabsContainer>
  );
};
