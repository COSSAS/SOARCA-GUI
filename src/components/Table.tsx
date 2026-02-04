import styled from "styled-components";

/**
 * Table components with theme-based styling.
 * Provides a complete set of components for building accessible tables with consistent styling:
 * - Table: Main container
 * - TableHead: Header section
 * - TableBody: Body section containing data rows
 * - HeaderCell: Individual header cells with optional width and alignment
 * - Row: Table rows with alternating backgrounds and hover effects
 * - Cell: Data cells with optional alignment
 * - EmptyState: Placeholder for empty tables
 * @example
 * <Table>
 *   <TableHead>
 *     <Row>
 *       <HeaderCell>Name</HeaderCell>
 *       <HeaderCell $width="100px" $alignContent="center">Status</HeaderCell>
 *     </Row>
 *   </TableHead>
 *   <TableBody>
 *     <Row $isClickable onClick={handleClick}>
 *       <Cell>Item 1</Cell>
 *       <Cell $alignContent="center">Active</Cell>
 *     </Row>
 *   </TableBody>
 * </Table>
 */
export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 ${({ theme }) => theme.spacing.xs};

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.table.rowText};

  background: transparent;
`;

/**
 * Table header section.
 * Wraps header row(s) and applies themed background styling.
 * @example
 * <TableHead>
 *   <Row>
 *     <HeaderCell>Column 1</HeaderCell>
 *   </Row>
 * </TableHead>
 */
export const TableHead = styled.thead`
  text-align: left;

  & > tr {
    background: transparent;
    border-top: 1px solid ${({ theme }) => theme.colors.table.headerBg};
    border-bottom: 1px solid ${({ theme }) => theme.colors.table.headerBg};
  }
`;

export interface HeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  $width?: string;
  $alignContent?: string;
}

/**
 * Table header cell with optional width and alignment customization.
 * Renders as <th> with medium font weight and theme-based header colors.
 * @param $width - Optional fixed width (e.g., "100px", "20%"). Defaults to "auto".
 * @param $alignContent - Text alignment: "left", "center", "right". Defaults to "left".
 * @example
 * <HeaderCell>Default</HeaderCell>
 * <HeaderCell $width="150px" $alignContent="center">Centered</HeaderCell>
 */
export const HeaderCell = styled.th<HeaderCellProps>`
  background: ${({ theme }) => theme.colors.table.headerBg};

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.table.headerText};

  width: ${({ $width }) => $width || "auto"};
  text-align: ${({ $alignContent }) => $alignContent || "left"};

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.radius.md};
    border-bottom-left-radius: ${({ theme }) => theme.radius.md};
  }
  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.radius.md};
    border-bottom-right-radius: ${({ theme }) => theme.radius.md};
  }
`;

/**
 * Table body section containing data rows.
 * @example
 * <TableBody>
 *   <Row><Cell>Data</Cell></Row>
 * </TableBody>
 */
export const TableBody = styled.tbody``;

export interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  $isClickable?: boolean;
}

/**
 * Table row with alternating background colors and hover effects.
 * @param $isClickable - When true, shows pointer cursor on hover for interactive rows. Defaults to false.
 * @example
 * // Non-clickable row
 * <Row><Cell>Data</Cell></Row>
 * @example
 * // Clickable row
 * <Row $isClickable onClick={() => alert('clicked')}><Cell>Data</Cell></Row>
 */
export const Row = styled.tr<RowProps>`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.table.rowEvenBg};
  }
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.table.rowOddBg};
  }

  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
  transition:
    box-shadow ${({ theme }) => theme.transitions.base},
    background ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary.main}14`};
    cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
  }
`;

export interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  $alignContent?: string;
}

/**
 * Table data cell with optional text alignment.
 * @param $alignContent - Text alignment: "left", "center", "right". Defaults to "left".
 * @example
 * <Cell>Left aligned content</Cell>
 * <Cell $alignContent="center">Centered</Cell>
 */
export const Cell = styled.td<CellProps>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};

  border-top: 1px solid ${({ theme }) => theme.colors.table.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.table.border};
  text-align: ${({ $alignContent }) => $alignContent || "left"};
  color: ${({ theme }) => theme.colors.table.rowText};

  &:first-child {
    border-left: 1px solid ${({ theme }) => theme.colors.table.border};
    border-top-left-radius: ${({ theme }) => theme.radius.md};
    border-bottom-left-radius: ${({ theme }) => theme.radius.md};
  }
  &:last-child {
    border-right: 1px solid ${({ theme }) => theme.colors.table.border};
    border-top-right-radius: ${({ theme }) => theme.radius.md};
    border-bottom-right-radius: ${({ theme }) => theme.radius.md};
  }
`;

/**
 * Empty state placeholder for tables with no data.
 * @example
 * {data.length === 0 && <EmptyState>No items found</EmptyState>}
 */
export const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};

  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.body.font};
`;
