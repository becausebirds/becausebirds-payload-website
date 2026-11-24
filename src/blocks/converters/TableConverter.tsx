import React from 'react'
import { cn } from '@/utilities/ui'

/* ── Shared table primitives ──
   Used by BOTH renderers:
     • src/components/RichTextServer.tsx (post/page body)
     • src/components/RichText/index.tsx (client / live preview)

   Two different ideas, deliberately kept apart:

     TableCell `header`  → this cell is a <th>. Semantics + UA bold weight only.
                           NO color, NO background.
     TableRow  `header`  → this ROW is the top/column-header row. Only this row
                           gets mint + black. Lives on TableHead / TableRow.

   Lexical marks first-column cells with headerState 1 → they are <th>, but they
   keep the normal body colors. Putting the mint on the row (not the cell) is what
   keeps a header *column* from turning green.
*/

export const TableWrapper: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('not-prose my-8 w-full overflow-x-auto', className)}>
    <table className="w-full border-collapse border-2 border-black text-left align-top text-sm text-foreground dark:border-border md:text-base">
      {children}
    </table>
  </div>
)

/* Mint skin for the TOP ZONE only (thead, or a row explicitly flagged `header`). */
const headerSkin =
  'bg-[#76fbd9] text-black [&_*]:text-black [&_th]:font-black [&_th]:uppercase [&_th]:tracking-tight'

export const TableHead: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <thead className={headerSkin}>{children}</thead>
)

export const TableBody: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
)

export const TableRow: React.FC<{ children?: React.ReactNode; header?: boolean }> = ({
  children,
  header,
}) => (
  <tr
    className={cn(
      'border-b-2 border-black last:border-b-0 dark:border-border',
      header && headerSkin,
    )}
  >
    {children}
  </tr>
)

export const TableCell: React.FC<{
  children?: React.ReactNode
  /** Render as <th>. Tag + a11y only — carries no color and no background. */
  header?: boolean
  colSpan?: number
  rowSpan?: number
  /** Optional: 'row' for first-column headers, 'col' for top-row headers. */
  scope?: 'row' | 'col'
}> = ({ children, header, colSpan, rowSpan, scope }) =>
  React.createElement(
    header ? 'th' : 'td',
    {
      colSpan,
      rowSpan,
      scope: header ? scope : undefined,
      className: cn(
        'border-2 border-black px-3 py-2 align-top dark:border-border',
        // cells contain real lexical paragraphs — kill the prose margins
        '[&>p]:my-0 [&>p]:leading-snug [&>ul]:my-0 [&>ul]:pl-4 [&>ol]:my-0 [&>ol]:pl-4',
        // prose is cancelled by `not-prose`, so restore link affordances by hand
        '[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-2',
        '[&_a:hover]:decoration-1 [&_a:hover]:opacity-80',
        // optional: give body-cell links the theme accent so they read as links
        // '[&_a]:text-primary',
      ),
    },
    children,
  )


/* ── Header detection (lexical uses `tableheader` nodes and/or headerState) ── */
export const isHeaderCell = (cell: any): boolean =>
  cell?.type === 'tableheader' || (cell?.headerState ?? 0) > 0

/* True only when EVERY cell in the row is a header cell — i.e. a top/column-header
   row. A row whose first cell alone is a row header returns false, which is why
   body rows never get the mint skin. */
export const isHeaderRow = (row: any): boolean => {
  const cells: any[] = row?.children ?? []
  return cells.length > 0 && cells.every(isHeaderCell)
}

/* ── Block-shape tables ({ blockType: 'table', rows: [{ cells: [...] }] }) ── */
const cellText = (v: any): string => {
  if (v == null) return ''
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (Array.isArray(v)) return v.map(cellText).join('')
  if (typeof v === 'object') {
    if (typeof v.value === 'string') return v.value
    if (typeof v.text === 'string') return v.text
    if (v.children) return cellText(v.children)
  }
  return ''
}

export const TableBlock: React.FC<{
  rows?: Array<{ cells?: any[] }> | null
  headerRow?: boolean
  className?: string
}> = ({ rows, headerRow = true, className }) => {
  if (!rows?.length) return null

  const normalized = rows.map((row) => (row?.cells ?? []).map(cellText))
  if (!normalized.length) return null

  const head = headerRow ? normalized[0] : null
  const body = headerRow ? normalized.slice(1) : normalized

  return (
    <TableWrapper className={className}>
      {head && (
        <TableHead>
          <TableRow header>
            {head.map((cell, i) => (
              <TableCell key={i} header scope="col">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {body.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableWrapper>
  )
}
