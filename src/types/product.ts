export interface ProductFormValues {
  title: string;
  description: string;
  images: File[];
  weight: string;
  basePrice: string;
  discount: string;
  category: string;
  subcategory: string;
  addons: {
    name: string;
    type: string;
    options: {
      name: string;
      priceModification: string;
    }[];
  }[];
  type: string;
  store: string;
  outOfStock: boolean;
  isActive: boolean;
}

export interface ProductData {
  product: ProductFormValues;
}
