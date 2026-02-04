import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

import styled from "styled-components";
import { Icon } from "../Icon";
import { CardBody, CardContainer, CardFooter, CardHeader } from "./Card";

const ToggleButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
`;

const ToggleIconWrapper = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  transition: transform ${({ theme }) => theme.transitions.base};
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
`;

export interface ExpandableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  $header: React.ReactNode;
  $footer?: React.ReactNode;
  $defaultExpanded?: boolean;
  $hideFooterWhenCollapsed?: boolean;
}

/**
 * ExpandableCard component that shows a header which can be clicked to expand/collapse the body content.
 * @param $header - Header content rendered in the non-collapsible header area.
 * @param $footer - Optional footer content shown when expanded (or always if configured).
 * @param $defaultExpanded - Whether the card should start in the expanded state (default: false).
 * @param $hideFooterWhenCollapsed - When true, hides the footer while collapsed (default: true).
 * @example
 * <ExpandableCard
 *   $header={<div>Click to Expand</div>}
 *   $footer={<div>Footer Content</div>}
 *   $defaultExpanded={false}>
 *   <p>This is the expandable body content.</p>
 * </ExpandableCard>
 */
export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  $header,
  $footer,
  children,
  $defaultExpanded = false,
  $hideFooterWhenCollapsed = true,
  ...rest
}) => {
  const [expanded, setExpanded] = useState($defaultExpanded);

  return (
    <CardContainer {...rest}>
      <CardHeader
        role="button"
        $isClickable
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>{$header}</div>
        <ToggleButton>
          <ToggleIconWrapper $expanded={expanded}>
            <Icon $icon={ChevronDown} />
          </ToggleIconWrapper>
        </ToggleButton>
      </CardHeader>
      {expanded && <CardBody>{children}</CardBody>}
      {(expanded || !$hideFooterWhenCollapsed) && $footer ? (
        <CardFooter>{$footer}</CardFooter>
      ) : null}
    </CardContainer>
  );
};
