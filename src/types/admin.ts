import type React from "react";
// Admin related types
export interface AdminType {
  _id: string;
  name: string;
  privileges: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  type: AdminType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AdminsResponse {
  data: Admin[];
  totalCount: number;
}

export interface AdminTypesResponse {
  data: AdminType[];
  totalCount: number;
}

// Form related types
export interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: string;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: string;
}

export interface UpdateAdminRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  type: string;
}

export interface DeleteAdminRequest {
  id: string;
}

// Search and pagination types
export interface SearchParams {
  limit: number;
  page?: number;
  term: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Table related types
export interface TableColumn {
  key: string;
  header: string;
  sortable: boolean;
  filterable: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: any;
}

export interface ActionItem {
  label: string;
  onClick: (record: Admin) => void;
  icon: React.ReactNode;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
