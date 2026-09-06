import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, FolderSearch } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search query.',
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [data, sortKey, sortDirection]);

  if (data.length === 0) {
    return (
      <div className="py-12 bg-slate-900/30 rounded-xl border border-slate-800/80">
        <EmptyState icon={FolderSearch} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 ${className}`}>
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3.5 px-4 font-mono text-[11px] ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-200' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 text-slate-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedData.map((item) => (
              <tr
                key={String(item[keyField])}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-slate-800/50 hover:border-cyan-500/30'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3.5 px-4 text-slate-200 ${col.className || ''}`}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Transformation */}
      <div className="md:hidden divide-y divide-slate-800/80">
        {sortedData.map((item) => (
          <div
            key={String(item[keyField])}
            onClick={() => onRowClick?.(item)}
            className={`p-4 space-y-3 transition-colors ${
              onRowClick ? 'cursor-pointer active:bg-slate-800/70' : ''
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 uppercase font-mono text-[10px]">{col.header}</span>
                <div className="text-slate-200 font-medium">
                  {col.render ? col.render(item) : item[col.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
