import styled from "styled-components";

export const PopoverTrigger = styled.button<{ $anchorName: string }>`
  anchor-name: ${({ $anchorName }) => $anchorName};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radius.md};

  &:hover {
    color: ${({ theme }) => theme.colors.info.border};
    background: ${({ theme }) => theme.colors.info.bg};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.info.border};
    outline-offset: 2px;
  }
`;

export const PopoverContent = styled.div<{ $anchorName: string }>`
  inset: auto;
  position-anchor: ${({ $anchorName }) => $anchorName};
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;

  inline-size: max-content;
  min-inline-size: min(10rem, calc(100vw - 1rem));
  max-inline-size: min(18rem, calc(100vw - 1rem));
  max-block-size: min(24rem, 90dvh);
  margin: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.lg};

  color: ${({ theme }) => theme.colors.text.primary};

  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  &:popover-open {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  @media (max-width: 20rem), (max-height: 20rem) {
    inset: auto ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} auto;
    position-area: none;
    max-block-size: calc(100dvh - 1rem);
    margin: 0;
  }
`;

export const PopoverItemButton = styled.button`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  inline-size: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.info.border};
  text-align: start;

  &:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      ${({ theme }) => theme.colors.info.solidBg} ${({ theme }) => theme.interactions.subtleMix},
      ${({ theme }) => theme.colors.background.primary}
    );
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.info.border};
    outline-offset: -2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
  }
`;
