import styled from "styled-components";

import { panelWidth } from "../visual-editor/pages/panelWidth";

// Fills the content area so the page itself never scrolls.
export const DetailPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  height: 100%;
  min-height: 30rem;
`;

export const DetailHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  justify-content: space-between;
`;

export const TitleRow = styled.div`
  display: flex;
  flex: 1 1 20rem;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  min-width: 0;
`;

export const PageTitle = styled.h2`
  overflow: hidden;

  margin: 0;

  font: ${({ theme }) => theme.typography.h2.font};
  color: ${({ theme }) => theme.colors.text.primary};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DetailBody = styled.div<{ $panelCollapsed: boolean }>`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    ${({ $panelCollapsed }) => panelWidth("right", $panelCollapsed)};
  flex: 1;
  gap: ${({ theme }) => theme.spacing.lg};

  min-height: 0;

  transition: grid-template-columns ${({ theme }) => theme.transitions.base};
`;

export const DiagramFrame = styled.div`
  overflow: hidden;
  min-height: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  background: ${({ theme }) => theme.colors.background.primary};
`;

export const DetailSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  & + & {
    padding-top: ${({ theme }) => theme.spacing.lg};
    border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;

export const FieldGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0;
`;

export const Field = styled.div<{ $wide?: boolean }>`
  display: flex;
  grid-column: ${({ $wide }) => ($wide ? "1 / -1" : "auto")};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  min-width: 0;
`;

export const FieldLabel = styled.dt`
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const FieldValue = styled.dd`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// The ID stays on one line; the full value is in the tooltip and the copy button.
export const IdValue = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  & > span {
    overflow: hidden;
    flex: 1;

    font: ${({ theme }) => theme.typography.code.font};
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const BadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ReferenceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow-wrap: anywhere;

  & + & {
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

export const Description = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre-line;
`;

export const EmptyText = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;