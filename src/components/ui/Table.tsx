import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import { Button } from './Button';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortKey?: keyof T;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filterComponent?: (data: T[]) => T[];
  exportFileName?: string;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  filterComponent,
  exportFileName = 'export-data'
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Handle Search
  const searchedData = useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    return data.filter(row => {
      const val = row[searchKey];
      if (typeof val === 'string') {
        return val.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (typeof val === 'number') {
        return val.toString().includes(searchQuery);
      }
      return false;
    });
  }, [data, searchQuery, searchKey]);

  // 2. Handle Custom Filters
  const filteredData = useMemo(() => {
    if (filterComponent) {
      return filterComponent(searchedData);
    }
    return searchedData;
  }, [searchedData, filterComponent]);

  // 3. Handle Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === undefined || bVal === undefined) return 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
    return sorted;
  }, [filteredData, sortKey, sortDirection]);

  // 4. Handle Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Mock Export Functionality
  const handleExport = () => {
    if (sortedData.length === 0) return;
    
    // Create CSV header
    const headers = columns.map(c => c.header).join(',');
    
    // Create CSV lines
    const rows = sortedData.map(row => 
      columns.map(col => {
        if (typeof col.accessor === 'function') {
          // Fallback if accessory is render function - try to get matching string or strip it
          return `"${String(col.header)}"`;
        }
        return `"${String(row[col.accessor] || '')}"`;
      }).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900">
        {searchKey ? (
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-all placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto flex-1 min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800 sticky top-0 backdrop-blur-md z-10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => handleSort(col.sortKey)}
                  className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none ${
                    col.sortKey ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/55 hover:text-slate-800 dark:hover:text-slate-200' : ''
                  } ${col.className || ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortKey && col.sortKey === sortKey && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/80">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-6 py-4.5 text-sm text-slate-600 dark:text-slate-300 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700 dark:text-slate-200">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? 'primary' : 'outline'}
                size="sm"
                className={`w-8 h-8 p-0 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  currentPage === index + 1 ? 'bg-primary dark:bg-blue-600 text-white' : 'text-slate-705 dark:text-slate-300'
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
