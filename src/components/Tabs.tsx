import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import { TabsContext, TabsContextType, useTabs } from "./utils";

interface TabOption {
  id: string;
  label: React.ReactNode;
}

export interface TabsProviderProps {
  children: ReactNode;
  initialTab: string;
}

/**
 * Provider component that manages tab state using React Context.
 * Must wrap the Tabs component and any child components that need to access tab state via useTabs hook.
 * Provides activeTab, selectTab, and isActive methods to all descendants through context.
 * @param initialTab - The id of the tab that should be active on mount. Must match one of the tab ids.
 * @param children - Child components that will have access to tab context. Should include Tabs component and content that responds to tab changes.
 * @example
 * // Basic tabs with provider
 * <TabsProvider initialTab="overview">
 *   <Tabs tabs={[
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
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const value: TabsContextType = {
    activeTab,
    selectTab: (tabId: string) => setActiveTab(tabId),
    isActive: (tabId: string) => tabId === activeTab,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TabOption[];
}

const TabsContainer = styled.div`
  display: flex;

  gap: ${({ theme }) => theme.spacing.lg};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  background: none;
  border: none;

  border-bottom: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary.main : "transparent"};

  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.body.font};

  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.primary.hover : theme.colors.text.primary};
    border-bottom-color: ${({ theme, $active }) =>
      $active ? theme.colors.primary.hover : "none"};
  }
`;

/**
 * Tabs navigation component for switching between different views or sections.
 * Renders a horizontal list of tab buttons with active state.
 * Must be used within a `TabsProvider` to access tab state management.
 * Tab selection is controlled through the `useTabs` context.
 * @param tabs - Array of tab objects with unique stable id and display label. Each tab requires: { id: string, label: ReactNode }.
 * @example
 * // Simple text tabs
 * <TabsProvider initialTab="timeline">
 *   <Tabs tabs={[
 *     { id: "timeline", label: "Timeline" },
 *     { id: "detailed", label: "Detailed View" },
 *     { id: "summary", label: "Summary" }
 *   ]} />
 * </TabsProvider>
 * @example
 * // Tabs with icons
 * <Tabs tabs={[
 *   { id: "list", label: <><ListIcon /> List</> },
 *   { id: "grid", label: <><GridIcon /> Grid</> }
 * ]} />
 */
export const Tabs: React.FC<TabsProps> = ({ tabs, ...rest }) => {
  const { activeTab, selectTab } = useTabs();

  return (
    <TabsContainer {...rest}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          type="button"
          $active={tab.id === activeTab}
          onClick={() => selectTab(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabsContainer>
  );
};
