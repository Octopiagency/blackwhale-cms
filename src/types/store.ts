export interface StoreAddress {
  state: string;
  city: string;
  street: string;
  postalCode: string;
  lng: string;
  lat: string;
  _id?: string;
}

export interface StorePhone {
  code: string | number;
  number: string | number;
}

export interface StoreImage {
  path: string;
  _id: string;
}

export interface Store {
  _id: string;
  title: string;
  description: string;
  address: StoreAddress[];
  phone: StorePhone;
  type: string;
  rating: number;
  image?: StoreImage;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  tokens?: string[];
  verificationCode?: string | null;
  __v: number;
}

export interface StoreFormValues {
  title: string;
  description: string;
  address: StoreAddress[];
  phone: StorePhone;
  type: string;
  rating: string;
  image: File | null;
  isActive: boolean;
}

export interface StoresResponse {
  data: Store[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface DeleteStoreRequest {
  id: string;
}

export type StoreType =
  | "retail"
  | "restaurant"
  | "service"
  | "grocery"
  | "pharmacy";
