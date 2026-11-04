import styled from "styled-components";

import { Button } from "@/components";

// Fills the panel, so only PanelTabContent scrolls.
export const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  height: 100%;
`;

export const SectionTitle = styled.div`
  font: ${({ theme }) => theme.typography.h4.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Hint = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const ProblemList = styled.ul`
  margin: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.warning.text};

  background: ${({ theme }) => theme.colors.warning.bg};
`;

export const TextArea = styled.textarea`
  resize: vertical;

  width: 100%;
  min-height: 4.5rem;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};

  background: ${({ theme }) => theme.colors.background.primary};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    outline: none;
  }
`;

export const PaletteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SelectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ItemButton = styled.button.attrs({ type: "button" })`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: start;

  background: ${({ theme }) => theme.colors.background.primary};

  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
  }
`;

export const PaletteItem = styled(ItemButton)`
  cursor: grab;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

export const RequiredMark = styled.span`
  margin-left: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.error.text};
`;

/** Error (blocks saving) or warning under a field. */
export const FieldMessage = styled.div<{ $blocking?: boolean }>`
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme, $blocking }) =>
    $blocking ? theme.colors.error.text : theme.colors.warning.text};
`;

export const CheckboxLabel = styled.label`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/** Line under the panel tabs. */
export const PanelTabBar = styled.div`
  flex-shrink: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

/**
 * The content of the active tab. It scrolls on its own so the tabs above stay put.
 * The negative margin moves the scrollbar to the panel edge.
 */
export const PanelTabContent = styled.div`
  overflow-y: auto;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  min-height: 0;
  margin-inline: calc(-1 * ${({ theme }) => theme.spacing.lg});
  padding-inline: ${({ theme }) => theme.spacing.lg};
`;

/** Number of problems on a tab or an entry. Red when one of them blocks saving. */
export const IssueCount = styled.span<{ $blocking: boolean }>`
  min-width: 1.1rem;
  padding: 0 ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radius.full};

  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme, $blocking }) =>
    $blocking ? theme.colors.error.text : theme.colors.warning.text};
  text-align: center;

  background: ${({ theme, $blocking }) =>
    $blocking ? theme.colors.error.bg : theme.colors.warning.bg};
`;

export const EntryList = styled.ul`
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};

  list-style: none;
`;

export const EntryItem = styled.li`
  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

export const EntryToggle = styled.button`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: start;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
`;

export const EntryChevron = styled.span<{ $open: boolean }>`
  transform: rotate(${({ $open }) => ($open ? "90deg" : "0deg")});
  display: inline-flex;
  transition: transform ${({ theme }) => theme.transitions.fast};
`;

export const EntryTitle = styled.span`
  overflow: hidden;
  flex: 1;

  min-width: 0;

  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EntryType = styled.span`
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const EntryBody = styled.div`
  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  background: ${({ theme }) => theme.colors.background.tertiary};
`;

export const EntryActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const AddEntryForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

export const AddEntryButton = styled(Button)`
  flex-shrink: 0;
  white-space: nowrap;
`;

// The divider sits at the same distance from the last step as from the hint.
export const HelpSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const HelpItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;

export const SpecBadgeRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
