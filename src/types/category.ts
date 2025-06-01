/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CategoryImage {
  path: string;
  _id: string;
}

export interface Category {
  _id: string;
  title: string;
  type: string;
  image?: CategoryImage;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoryFormData {
  title: string;
  type: string;
  image: string | null | any;
  isActive: boolean;
}

export interface CategoryCreateRequest {
  title: string;
  type: string;
  image?: File;
  isActive: boolean;
}

export interface CategoryUpdateRequest extends CategoryCreateRequest {
  id: string;
}

export interface CategoriesResponse {
  data: Category[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface DeleteCategoryRequest {
  id: string;
}

export type CategoryType = "store" | "restaurant";

export interface CategoryTypeOption {
  label: string;
  value: CategoryType;
}

export interface CategoryStatusOption {
  label: string;
  value: boolean;
}
