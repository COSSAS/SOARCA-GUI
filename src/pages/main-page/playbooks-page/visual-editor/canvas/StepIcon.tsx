import type { TablerIcon } from "@tabler/icons-react";
import styled from "styled-components";

import { Icon, ThemeSize } from "@/components";

import type { StepColor } from "../model/specs";
import { getStepColors } from "./colors";

// styled() does not pass $ props on to a component, so the icon is a plain prop here.
const RoundIcon: React.FC<{ icon: TablerIcon; className?: string }> = ({
  icon,
  className,
}) => (
  <Icon $icon={icon} $size={ThemeSize.Small} $round className={className} />
);

/** The round icon of a step type, in the step type's colour. */
export const StepIcon = styled(RoundIcon)<{ $color: StepColor }>`
  ${({ theme, $color }) => {
    const colors = getStepColors(theme, $color);
    return `
      border: 1px solid ${colors.border};
      color: ${colors.solidText};
      background-color: ${colors.solidBg};
    `;
  }}
`;