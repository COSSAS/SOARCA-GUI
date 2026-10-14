import React, { createContext, useContext } from "react";
import styled from "styled-components";

const PopoverContext = createContext<string | undefined>(undefined);

const PopoverTrigger = styled.button<{ $anchorName: string }>`
  anchor-name: ${({ $anchorName }) => $anchorName};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;

  color: inherit;

  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.info.bg};
    color: ${({ theme }) => theme.colors.info.border};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.info.border};
    outline-offset: 2px;
  }
`;

const PopoverContent = styled.div<{ $anchorName: string }>`
  inset: auto;
  position-anchor: ${({ $anchorName }) => $anchorName};
  position-area: block-end span-inline-end;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;

  box-sizing: border-box;
  inline-size: max-content;
  min-inline-size: min(10rem, calc(100vw - 1rem));
  max-inline-size: min(18rem, calc(100vw - 1rem));
  max-block-size: min(24rem, 90dvh);

  margin: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  color: ${({ theme }) => theme.colors.text.primary};

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

const PopoverItemButton = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  box-sizing: border-box;
  inline-size: 100%;

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;

  color: ${({ theme }) => theme.colors.info.border};
  font: ${({ theme }) => theme.typography.caption.font};
  text-align: start;

  cursor: pointer;

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
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};

    cursor: not-allowed;
  }
`;

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  $label: string;
  $trigger: React.ReactNode;
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
  $label,
  $trigger,
  id,
  children,
  ...contentProps
}) => {
  const anchorName = `--${id}`;

  return (
    <>
      <PopoverTrigger
        type="button"
        $anchorName={anchorName}
        popoverTarget={id}
        aria-controls={id}
        aria-label={$label}
      >
        {$trigger}
      </PopoverTrigger>
      <PopoverContext.Provider value={id}>
        <PopoverContent
          role="group"
          aria-label={$label}
          {...contentProps}
          id={id}
          popover="auto"
          $anchorName={anchorName}
        >
          {children}
        </PopoverContent>
      </PopoverContext.Provider>
    </>
  );
};

export type PopoverItemProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverItem: React.FC<PopoverItemProps> = (props) => {
  const targetId = useContext(PopoverContext);

  return (
    <PopoverItemButton
      type="button"
      popoverTarget={targetId}
      popoverTargetAction="hide"
      {...props}
    />
  );
};
