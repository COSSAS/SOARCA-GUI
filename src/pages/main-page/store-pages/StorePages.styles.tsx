import styled from "styled-components";

export const ResourcesLayout = styled.section.attrs<{
  "data-fill-height"?: boolean;
}>({ "data-fill-height": true })`
  display: flex;
  flex-direction: column;

  min-width: 0;
  height: 100%;
  min-height: 12rem;
`;

export const TableTabs = styled.nav`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.lg};

  margin: 0 ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dataTable.border};

  a {
    display: block;

    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-bottom: 2px solid transparent;

    font: ${({ theme }) => theme.typography.body.font};
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
  }

  a[aria-current="page"] {
    border-bottom-color: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
`;

export const TableToolbar = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  justify-content: space-between;

  padding: ${({ theme }) => theme.spacing.lg};

  input {
    width: 15rem;
    max-width: 100%;
  }
`;

export const TableInset = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
  min-height: 0;
  padding: 0 ${({ theme }) => theme.spacing.lg}
    ${({ theme }) => theme.spacing.lg};
`;

export const TableNotice = styled.p`
  margin: 0;
  padding: 0 ${({ theme }) => theme.spacing.lg}
    ${({ theme }) => theme.spacing.lg};
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const HistoryLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  min-width: 0;

  input {
    width: 15rem;
    max-width: 100%;
  }

  select {
    width: 9rem;
  }
`;

export const TableText = styled.span`
  overflow: hidden;
  display: inline-block;

  max-width: 9rem;

  text-overflow: ellipsis;
  vertical-align: middle;
`;

export const Mono = styled.span<{ $maxWidth?: string }>`
  overflow: hidden;
  display: inline-block;

  max-width: ${({ $maxWidth }) => $maxWidth ?? "9rem"};

  font: ${({ theme }) => theme.typography.code.font};
  color: ${({ theme }) => theme.colors.text.primary};
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;

  [data-current] & {
    color: ${({ theme }) => theme.colors.success.text};
  }
`;

export const Muted = styled.span`
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const RowActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  justify-content: flex-end;
  min-height: ${({ theme }) => theme.control_height.sm};

  button {
    width: 1.75rem;
    padding: 0;
    border-color: transparent;
  }
`;
