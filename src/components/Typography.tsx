import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  $color?: string;
}

/**
 * Text/paragraph component with customizable color and no default margin.
 * Renders as <p> element with theme-based body typography.
 * @param $color - Custom text color as hex, rgb, or CSS color string. Defaults to theme.colors.text.secondary if not specified.
 * @example
 * // Using theme color
 * <Text $color={theme => theme.colors.primary.main}>Primary colored text</Text>
 */
export const Text = styled.p<TextProps>`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ $color, theme }) => $color || theme.colors.text.secondary};
`;

interface ExpandableTextContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  $expanded?: boolean;
  $lineClamp?: number;
}

const ExpandableTextContainer = styled.div<ExpandableTextContainerProps>`
  word-break: break-word;

  ${({ $expanded, $lineClamp }) =>
    !$expanded
      ? `
        display: -webkit-box;
        -webkit-line-clamp: ${$lineClamp || 2};
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        `
      : ""}
`;

const ExpandToggle = styled.button`
  color: ${({ theme }) => theme.colors.primary.main};
  font: ${({ theme }) => theme.typography.small.font};
  margin-top: ${({ theme }) => theme.spacing.xs};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.hover};
  }
`;

export interface ExpandableTextProps {
  $text: ReactNode;
  $lineClamp?: number;
  $showMoreLabel?: string;
  $showLessLabel?: string;
}

/**
 * Expandable text component with automatic overflow detection and show more/less toggle.
 * Clamps text to 2 lines by default with ellipsis, and adds a toggle button only when content overflows.
 * @param $text - Content to display.
 * @param $lineClamp - Number of lines to clamp when collapsed. Defaults to 2.
 * @param $showMoreLabel - Custom label for the expand button. Defaults to "Show more".
 * @param $showLessLabel - Custom label for the collapse button. Defaults to "Show less".
 * @example
 * // Simple text expansion
 * <ExpandableText $text="Very long text that will be clamped to 2 lines..." />
 * @example
 * // Custom button labels
 * <ExpandableText
 *   $text={longDescription}
 *   $showMoreLabel="Read full description"
 *   $showLessLabel="Collapse"
 * />
 * @example
 * <ExpandableText $text={<Text>Formatted content with <strong>bold</strong> text</Text>} />
 */
export const ExpandableText: React.FC<ExpandableTextProps> = ({
  $text,
  $lineClamp,
  $showMoreLabel,
  $showLessLabel,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkClamp = () => {
      if (containerRef.current && !expanded) {
        const element = containerRef.current;
        // Check if the content is actually being clamped
        setIsClamped(element.scrollHeight > element.clientHeight);
      }
    };

    checkClamp();

    // Recheck on window resize
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [$text, expanded]);

  return (
    <div>
      <ExpandableTextContainer
        ref={containerRef}
        $expanded={expanded}
        $lineClamp={$lineClamp}
      >
        {$text}
      </ExpandableTextContainer>
      {isClamped && (
        <ExpandToggle onClick={() => setExpanded(!expanded)}>
          {expanded
            ? $showLessLabel || "Show less"
            : $showMoreLabel || "Show more"}
        </ExpandToggle>
      )}
    </div>
  );
};

export interface ImageContainerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  $width?: string;
}

/**
 * Image component with customizable width while maintaining aspect ratio.
 * @param $width - Desired width of the image (e.g., "200px", "50%"). Defaults to "15rem".
 * @example
 * // Fixed width
 * <ImageContainer $width="200px" src="image.jpg" alt="Example" />
 */
export const ImageContainer = styled.img<ImageContainerProps>`
  display: block;
  width: ${({ $width }) => $width || "15rem"};
  height: auto;
  aspect-ratio: auto;
`;
