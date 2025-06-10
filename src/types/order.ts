/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OrderProduct {
  product: string;
  quantity: number;
  addons?: any[];
  basePrice?: number;
  orderPrice?: number;
  orderQuantity?: number;
  title?: string;
  price?: number;
  category?: any;
  store?: string;
  type?: string;
  description?: string;
  images?: any[];
  reviews?: any[];
  isActive?: boolean;
  weight?: number;
}

export interface ShippingAddress {
  state: string;
  city: string;
  street: string;
  postalCode: number;
  lng: number;
  lat: number;
}

export interface OrderUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: {
    code: string;
    number: string;
  };
}

export interface Order {
  _id: string | any;
  user?: string;
  products: OrderProduct[] | any[];
  shippingAddress: ShippingAddress;
  store: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  subtotal: number;
  shippingFee: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormValues {
  user: string;
  products: {
    product: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  store: string;
  status?: string;
}

export interface OrdersResponse {
  data: Order[];
  totalCount: number;
}

export interface DeleteOrderRequest {
  id: string;
}
