import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Fragment, useState, type ReactNode } from "react";
import styled from "styled-components";

import { ScrollArea } from "./ScrollArea";

const TableScrollArea = styled(ScrollArea)`
  --scroll-area-radius: calc(${({ theme }) => theme.radius.md} - 1px)
    calc(${({ theme }) => theme.radius.md} - 1px) 0 0;

  flex: 1 1 auto;

  width: 100%;
  min-height: 0;
  border: 1px solid ${({ theme }) => theme.colors.dataTable.border};
  border-bottom: 0;
  border-radius: ${({ theme }) => theme.radius.md}
    ${({ theme }) => theme.radius.md} 0 0;

  background: ${({ theme }) => theme.colors.dataTable.bodyBg};

  /* A size container, so the detail rows can use cqi units for the visible width. */
  > [data-radix-scroll-area-viewport] {
    container-type: inline-size;
  }
`;

const Grid = styled.table<{ $minWidth: number }>`
  table-layout: fixed;
  border-collapse: collapse;

  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth}px;

  font: ${({ theme }) => theme.typography.caption.font};
  text-align: left;

  th,
  td {
    padding: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.dataTable.border};
    white-space: nowrap;
  }

  th:first-child,
  td:first-child {
    padding-left: ${({ theme }) => theme.spacing.lg};
  }

  th:last-child,
  td:last-child {
    padding-right: ${({ theme }) => theme.spacing.lg};
  }

  th {
    position: sticky;
    z-index: 2;
    top: 0;

    border-bottom: 0;

    font: ${({ theme }) => theme.typography.caption.font};
    font-weight: ${({ theme }) => theme.fonts.weight.medium};
    color: ${({ theme }) => theme.colors.dataTable.headerText};

    background: ${({ theme }) => theme.colors.dataTable.headerBg};
    box-shadow: inset 0 -1px ${({ theme }) => theme.colors.dataTable.border};
  }

  td {
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text.primary};
    text-overflow: ellipsis;
  }

  td > span {
    max-width: 100%;
  }

  tbody tr:not([data-detail]) {
    background: ${({ theme }) => theme.colors.background.primary};
  }

  tbody tr:not([data-detail]):hover {
    background: ${({ theme }) => theme.colors.dataTable.rowHoverBg};
  }

  tbody tr:not([data-detail]):hover td:first-child {
    box-shadow: inset 3px 0 ${({ theme }) => theme.colors.primary.main};
  }

  [data-actions="true"] {
    position: sticky;
    z-index: 1;
    right: 0;

    text-align: right;

    background: ${({ theme }) => theme.colors.background.primary};
  }

  th[data-actions="true"] {
    z-index: 3;
    background: ${({ theme }) => theme.colors.dataTable.headerBg};
  }

  tbody tr:hover [data-actions="true"] {
    background: ${({ theme }) => theme.colors.dataTable.rowHoverBg};
  }

  td[data-detail-cell] {
    overflow: visible;
    padding: 0;
    white-space: normal;
    background: ${({ theme }) => theme.colors.dataTable.detailBg};
  }

  tr[data-open="false"] td {
    border-bottom-width: 0;
  }
`;

const DetailTransition = styled.div<{ $open: boolean }>`
  position: sticky;
  left: 0;

  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};

  width: min(100%, 100cqi);

  opacity: ${({ $open }) => ($open ? 1 : 0)};

  transition:
    grid-template-rows 220ms ease,
    opacity 220ms ease;

  @starting-style {
    grid-template-rows: 0fr;
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DetailContent = styled.div`
  overflow: hidden;
  min-height: 0;

  > div {
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  }
`;

function DetailRow({
  expanded,
  columnCount,
  render,
}: {
  expanded: boolean;
  columnCount: number;
  render: () => ReactNode;
}) {
  // Mounts on the first open and then stays, so CSS can animate closing too.
  const [opened, setOpened] = useState(expanded);
  if (expanded && !opened) setOpened(true);
  if (!opened) return null;
  return (
    <tr
      data-detail
      data-open={expanded}
      aria-hidden={!expanded}
      inert={!expanded}
    >
      <td data-detail-cell colSpan={columnCount}>
        <DetailTransition $open={expanded}>
          <DetailContent>
            <div>{render()}</div>
          </DetailContent>
        </DetailTransition>
      </td>
    </tr>
  );
}

const SortButton = styled.button`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
  color: inherit;

  &:hover {
    color: ${({ theme }) => theme.colors.dataTable.headerHoverText};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.dataTable.headerHoverText};
    outline-offset: 3px;
  }
`;

const Footer = styled.div`
  flex-shrink: 0;

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border: 1px solid ${({ theme }) => theme.colors.dataTable.border};

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};

  background: ${({ theme }) => theme.colors.dataTable.footerBg};
`;

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  label: string;
  emptyMessage: string;
  initialSorting?: SortingState;
  renderDetail?: (row: T) => ReactNode;
  getRowId?: (row: T) => string;
  /** Below this width in pixels the table scrolls horizontally. */
  minWidth?: number;
}

export function DataTable<T>({
  data,
  columns,
  label,
  emptyMessage,
  initialSorting = [],
  renderDetail,
  getRowId,
  minWidth = 850,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  // TanStack Table v8 returns mutable callbacks that React Compiler cannot memoize.
  // oxlint-disable-next-line react/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    getRowCanExpand: () => !!renderDetail,
    autoResetExpanded: false,
  });
  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const totalSize = visibleColumns.reduce(
    (sum, column) => sum + column.getSize(),
    0,
  );

  return (
    <>
      <TableScrollArea scrollbarOutside>
        <Grid aria-label={label} $minWidth={minWidth}>
          <colgroup>
            {visibleColumns.map((column) => (
              <col
                key={column.id}
                style={{ width: `${(column.getSize() / totalSize) * 100}%` }}
              />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const SortIcon =
                    sorted === "asc"
                      ? IconSortAscending
                      : sorted === "desc"
                        ? IconSortDescending
                        : IconArrowsSort;
                  return (
                    <th
                      key={header.id}
                      data-actions={header.column.id === "actions"}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <SortButton
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIcon size={14} />
                        </SortButton>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={row.id}>
                <tr>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      data-actions={cell.column.id === "actions"}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
                {renderDetail && (
                  <DetailRow
                    expanded={row.getIsExpanded()}
                    columnCount={row.getVisibleCells().length}
                    render={() => renderDetail(row.original)}
                  />
                )}
              </Fragment>
            ))}
          </tbody>
        </Grid>
      </TableScrollArea>
      <Footer>
        {rows.length === 0
          ? emptyMessage
          : `${rows.length} ${rows.length === 1 ? "result" : "results"}`}
      </Footer>
    </>
  );
}
