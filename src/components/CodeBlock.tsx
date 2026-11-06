import React from "react";
import styled, { css } from "styled-components";

import { CopyButton } from "./CopyButton";

const CodeContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

const Pre = styled.pre<{ $maxHeight?: string; $copyable?: boolean }>`
  counter-reset: line;

  overflow-y: auto;

  max-height: ${({ $maxHeight = "none" }) => $maxHeight};
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  padding-right: ${({ $copyable }) => ($copyable ? "2.5rem" : 0)};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.code.font};
  color: ${({ theme }) => theme.colors.text.primary};

  background: ${({ theme }) => theme.colors.background.secondary};
`;

// Long lines wrap, so the block never scrolls sideways. Numbers stay out of a copy.
const Line = styled.span<{ $numbered: boolean }>`
  display: block;
  padding-inline: ${({ theme }) => theme.spacing.md};
  overflow-wrap: anywhere;
  white-space: pre-wrap;

  ${({ $numbered, theme }) =>
    $numbered &&
    css`
      counter-increment: line;
      display: grid;
      grid-template-columns: 2.5em minmax(0, 1fr);
      padding-left: ${theme.spacing.xs};

      &::before {
        content: counter(line);
        user-select: none;

        padding-right: ${theme.spacing.sm};

        color: ${theme.colors.text.tertiary};
        text-align: right;
      }
    `}
`;

const CopyCorner = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
`;

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  $code: string;
  $copyable?: boolean;
  $maxHeight?: string;
}

/**
 * Read-only block of code or preformatted text. Lines are numbered when there is more than one.
 * @param $code - The text to show.
 * @param $copyable - Shows a copy button in the top-right corner (default: false).
 * @param $maxHeight - CSS max-height; longer content scrolls (default: none).
 * @example
 * <CodeBlock $code={script} $copyable $maxHeight="20rem" />
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  $code,
  $copyable = false,
  $maxHeight,
  ...rest
}) => {
  const lines = $code.split("\n");
  const numbered = lines.length > 1;
  return (
    <CodeContainer {...rest}>
      <Pre $maxHeight={$maxHeight} $copyable={$copyable}>
        {lines.map((line, index) => (
          <Line key={index} $numbered={numbered}>
            {line || " "}
          </Line>
        ))}
      </Pre>
      {$copyable && (
        <CopyCorner>
          <CopyButton $value={$code} title="Copy" />
        </CopyCorner>
      )}
    </CodeContainer>
  );
};

export default CodeBlock;
