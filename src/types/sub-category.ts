export interface SubCategoryImage {
  path: string;
  _id: string;
}

export interface SubCategory {
  _id: string;
  title: string;
  store: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SubCategoryFormData {
  title: string;
  store: string;
  isActive: boolean;
}

export interface SubCategoryCreateRequest {
  title: string;
  store: string;
  isActive: boolean;
}

export interface SubCategoryUpdateRequest extends SubCategoryCreateRequest {
  id: string;
}

export interface SubCategoriesResponse {
  data: SubCategory[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface DeleteSubCategoryRequest {
  id: string;
}

export type CategoryType = "store" | "restaurant";

export interface SubCategoryTypeOption {
  label: string;
  value: CategoryType;
}

export interface SubCategoryStatusOption {
  label: string;
  value: boolean;
}
