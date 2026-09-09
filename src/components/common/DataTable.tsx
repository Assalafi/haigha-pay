import React, { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Pagination, SkeletonRows, EmptyState } from '../ui'
import { cn } from '../../lib/cn'

export interface Column<T> {
  key: string
  label: React.ReactNode
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortValue?: (row: T) => string | number
  hideOnMobile?: boolean
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  pageSize = 10,
  onRowClick,
  empty,
  emptyAction,
  mobileCard,
}: {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  empty?: { icon?: React.ElementType; title: string; description?: string }
  emptyAction?: React.ReactNode
  mobileCard?: (row: T) => React.ReactNode
}) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })
    return arr
  }, [rows, sortKey, sortDir, columns])

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)
  resetPageWhenShrinks(rows.length, page, pageSize, setPage)

  if (loading) {
    return <SkeletonRows rows={6} cols={columns.length} />
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={empty?.icon}
        title={empty?.title ?? 'Nothing found here yet'}
        description={empty?.description}
        action={emptyAction}
      />
    )
  }

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line-soft bg-canvas/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint', c.headerClassName)}
                >
                  {c.sortValue ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-ink">
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('border-b border-line-soft/70 transition-colors last:border-0', onRowClick && 'cursor-pointer hover:bg-brand-soft/30')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-5 py-3.5 text-sm text-ink', c.className)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {paged.map((row, i) => (
          <div key={i}>{mobileCard ? mobileCard(row) : defaultMobileCell(row, columns)}</div>
        ))}
      </div>

      <Pagination page={page} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />
    </div>
  )
}

function defaultMobileCell<T>(row: T, columns: Column<T>[]) {
  const visible = columns.filter((c) => !c.hideOnMobile)
  return (
    <div className="rounded-2xl border border-line-soft bg-white p-4 shadow-card">
      {visible.slice(0, 3).map((c) => (
        <div key={c.key} className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-ink-faint">{c.label}</span>
          <span className="text-sm">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}</span>
        </div>
      ))}
    </div>
  )
}

function resetPageWhenShrinks(total: number, page: number, pageSize: number, setPage: (p: number) => void) {
  const max = Math.max(1, Math.ceil(total / pageSize))
  if (page > max) setPage(max)
}
