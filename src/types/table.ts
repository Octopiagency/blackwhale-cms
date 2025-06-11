/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ReactNode } from "react";

export type ColumnType = "string" | "number" | "boolean" | "array" | "switch";

export interface ColumnConfig {
  key: string;
  header: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, record: any) => ReactNode;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  value: string;
}

export interface DynamicTableProps {
  data: Record<string, any>[];
  columns: ColumnConfig[] | any[];
  isLoading?: boolean;
  hasActions?: boolean;
  actionItems?: ActionItem[];
  onRowClick?: (record: Record<string, any>) => void;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (record: Record<string, any>) => void;
  isVisible?: (record: Record<string, any>) => boolean;
}
