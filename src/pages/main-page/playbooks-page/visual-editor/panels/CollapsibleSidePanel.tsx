import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { ReactNode, Ref } from "react";

import { Icon, ThemeSize } from "@/components";

import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelHeading,
  SidePanelInner,
  SidePanelTabbedContent,
  SidePanelTitle,
  SidePanelToggle,
} from "../pages/VisualEditor.styles";

type CollapsibleSidePanelProps = {
  side: "left" | "right";
  /** Use the width of the right panel, e.g. for a left panel with long content. */
  wide?: boolean;
  label: string;
  title: ReactNode;
  actions?: ReactNode;
  /** The children bring their own scroll area below fixed tabs, see PanelBody. */
  tabbed?: boolean;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
};

export const CollapsibleSidePanel = ({
  side,
  wide,
  label,
  title,
  actions,
  tabbed = false,
  collapsed,
  onToggle,
  children,
  ref,
}: CollapsibleSidePanelProps) => {
  const pointsLeft = (side === "left") !== collapsed;
  const action = `${collapsed ? "Expand" : "Collapse"} ${label}`;

  return (
    <SidePanel ref={ref} $side={side} $collapsed={collapsed}>
      <SidePanelHeader $side={side}>
        <SidePanelToggle type="button" title={action} onClick={onToggle}>
          <Icon
            $icon={pointsLeft ? IconChevronLeft : IconChevronRight}
            $size={ThemeSize.Small}
          />
        </SidePanelToggle>
        <SidePanelHeading $collapsed={collapsed} inert={collapsed}>
          <SidePanelTitle>{title}</SidePanelTitle>
          {actions}
        </SidePanelHeading>
      </SidePanelHeader>
      {tabbed ? (
        <SidePanelTabbedContent
          $side={side}
          $wide={wide}
          $collapsed={collapsed}
          inert={collapsed}
        >
          {children}
        </SidePanelTabbedContent>
      ) : (
        <SidePanelContent
          $side={side}
          $wide={wide}
          $collapsed={collapsed}
          inert={collapsed}
        >
          <SidePanelInner>{children}</SidePanelInner>
        </SidePanelContent>
      )}
    </SidePanel>
  );
};
