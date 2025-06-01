"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import type {
  DynamicTableProps,
  ColumnConfig,
  SortConfig,
  FilterConfig,
  SortDirection,
} from "../types/table";

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  columns,
  isLoading = false,
  hasActions = false,
  actionItems = [],
  onRowClick,
  pagination,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters] = useState<FilterConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage || 1);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const actionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [actionMenuPosition, setActionMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // Reset to first page when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Update current page when pagination prop changes
  useEffect(() => {
    if (pagination?.currentPage) {
      setCurrentPage(pagination.currentPage);
    }
  }, [pagination?.currentPage]);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";

    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }

    setSortConfig(direction ? { key, direction } : null);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Toggle action menu
  const toggleActionMenu = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();

    if (isActionMenuOpen === index) {
      setIsActionMenuOpen(null);
    } else {
      const button = actionButtonRefs.current[index];
      if (button) {
        const rect = button.getBoundingClientRect();
        // Position the dropdown to the left of the button and below it
        setActionMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX - 120, // Offset to align to the right
        });
      }
      setIsActionMenuOpen(index);
    }
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node) &&
        !actionButtonRefs.current.some(
          (ref) => ref && ref.contains(event.target as Node)
        )
      ) {
        setIsActionMenuOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Apply sorting, filtering, and search to data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.length > 0) {
      result = result.filter((item) => {
        return filters.every((filter) => {
          const value = item[filter.key];
          if (value === undefined) return false;

          if (typeof value === "string") {
            return value.toLowerCase().includes(filter.value.toLowerCase());
          } else if (Array.isArray(value)) {
            return value.some((v) =>
              String(v).toLowerCase().includes(filter.value.toLowerCase())
            );
          } else {
            return String(value)
              .toLowerCase()
              .includes(filter.value.toLowerCase());
          }
        });
      });
    }

    // Apply search across all filterable columns
    if (searchTerm) {
      const filterableColumns = columns
        .filter((col) => col.filterable !== false)
        .map((col) => col.key);

      result = result.filter((item) => {
        return filterableColumns.some((key) => {
          const value = item[key];
          if (value === undefined) return false;

          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          } else if (Array.isArray(value)) {
            return value.some((v) =>
              String(v).toLowerCase().includes(searchTerm.toLowerCase())
            );
          } else {
            return String(value)
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          }
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        // Compare based on type
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (Array.isArray(aValue) && Array.isArray(bValue)) {
          // Sort by array length or first element
          return sortConfig.direction === "asc"
            ? aValue.length - bValue.length
            : bValue.length - aValue.length;
        } else {
          // Default comparison for numbers, booleans, etc.
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
      });
    }

    return result;
  }, [data, filters, searchTerm, sortConfig, columns]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const startIndex = (currentPage - 1) * pagination.pageSize;
    return processedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [processedData, currentPage, pagination]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
    }
  };

  // Render cell content based on column type
  const renderCell = (column: ColumnConfig, record: Record<string, any>) => {
    const value = record[column.key];

    // Use custom render function if provided
    if (column.render) {
      return column.render(value, record);
    }

    // Render based on column type
    switch (column.type) {
      case "boolean":
        return value ? "Yes" : "No";

      case "array":
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return "";

      case "switch":
        return (
          <div className="flex items-center justify-center">
            <div
              className={`w-10 h-5 rounded-full ${
                value ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              } relative`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${
                  value ? "right-0.5" : "left-0.5"
                }`}
              />
            </div>
          </div>
        );

      default:
        return value !== undefined ? String(value) : "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 relative"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center">
                    <span>{column.header}</span>
                    {column.sortable !== false && (
                      <button
                        className="ml-1 focus:outline-none group"
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortConfig?.key === column.key &&
                              sortConfig?.direction === "asc"
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 -mt-1 ${
                              sortConfig?.key === column.key &&
                              sortConfig?.direction === "desc"
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            }`}
                          />
                        </div>
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((record, index) => (
                <tr
                  key={index}
                  className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={onRowClick ? () => onRowClick(record) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-gray-900 dark:text-gray-100"
                    >
                      {renderCell(column, record)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-6 py-4 text-right relative">
                      <button
                        ref={(el) => {
                          actionButtonRefs.current[index] = el;
                        }}
                        onClick={(e) => toggleActionMenu(index, e)}
                        className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {isActionMenuOpen === index && actionItems.length > 0 && (
                        <div
                          ref={actionMenuRef}
                          className="fixed bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600 z-50"
                          style={{
                            top: `${actionMenuPosition.top}px`,
                            left: `${actionMenuPosition.left}px`,
                            minWidth: "160px",
                          }}
                        >
                          <div className="py-1">
                            {actionItems
                              .filter(
                                (item) =>
                                  !item.isVisible || item.isVisible(record)
                              )
                              .map((item, itemIndex) => (
                                <button
                                  key={itemIndex}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick(record);
                                    setIsActionMenuOpen(null);
                                  }}
                                >
                                  {item.icon && (
                                    <span className="mr-2">{item.icon}</span>
                                  )}
                                  {item.label}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage * pagination.pageSize >= pagination.totalItems
              }
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                currentPage * pagination.pageSize >= pagination.totalItems
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(
                    (currentPage - 1) * pagination.pageSize + 1,
                    pagination.totalItems
                  )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * pagination.pageSize,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronUp className="h-5 w-5 rotate-90" />
                </button>

                {/* Page numbers */}
                {Array.from({
                  length: Math.ceil(
                    pagination.totalItems / pagination.pageSize
                  ),
                }).map((_, index) => {
                  const page = index + 1;
                  // Show current page, first page, last page, and pages around current page
                  if (
                    page === 1 ||
                    page ===
                      Math.ceil(pagination.totalItems / pagination.pageSize) ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === 2 && currentPage > 3) ||
                    (page ===
                      Math.ceil(pagination.totalItems / pagination.pageSize) -
                        1 &&
                      currentPage <
                        Math.ceil(pagination.totalItems / pagination.pageSize) -
                          2)
                  ) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage * pagination.pageSize >= pagination.totalItems
                  }
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage * pagination.pageSize >= pagination.totalItems
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
