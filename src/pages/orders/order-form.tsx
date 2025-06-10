/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import type { Product } from "../products/products-list";
import type { Store } from "../../types/store";

// Updated interfaces
export interface ShippingAddress {
  state: string;
  city: string;
  street: string;
  postalCode: number;
  lng: number;
  lat: number;
}

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

interface OrderFormProps {
  initialData?: Order;
  onSubmit: (values: OrderFormValues) => void;
  isLoading: boolean;
  isEditMode: boolean;
  storesData: Store[] | undefined;
  productsData: Product[] | undefined;
}

const validationSchema = Yup.object({
  user: Yup.string().required("User is required"),
  products: Yup.array()
    .of(
      Yup.object({
        product: Yup.string().required("Product ID is required"),
        quantity: Yup.number()
          .min(1, "Quantity must be at least 1")
          .required("Quantity is required"),
      })
    )
    .min(1, "At least one product is required"),
  shippingAddress: Yup.object({
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    street: Yup.string().required("Street is required"),
    postalCode: Yup.number()
      .positive("Postal code must be positive")
      .required("Postal code is required"),
    lng: Yup.number().required("Longitude is required"),
    lat: Yup.number().required("Latitude is required"),
  }),
  store: Yup.string().required("Store ID is required"),
  status: Yup.string(),
});

export default function OrderForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
  storesData,
  productsData,
}: OrderFormProps) {
  const productOptions = productsData?.map((product) => ({
    value: product._id,
    label: product.title,
  }));

  const storeOptions = storesData?.map((store) => ({
    value: store._id,
    label: store.title,
  }));

  const formik = useFormik<OrderFormValues>({
    initialValues: {
      user: initialData?.user || "",
      products: initialData?.products?.map((p) => ({
        product:
          typeof p.product === "string" ? p.product : p.product?._id || "",
        quantity: p.quantity || p.orderQuantity || 1,
      })) || [
        {
          product: "",
          quantity: 1,
        },
      ],
      shippingAddress: initialData?.shippingAddress || {
        state: "",
        city: "",
        street: "",
        postalCode: 0,
        lng: 0,
        lat: 0,
      },
      store: initialData?.store || "",
      status: initialData?.status || "pending",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const orderStatuses = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Helper function to get error message safely
  const getFieldError = (fieldPath: string) => {
    const keys = fieldPath.split(".");
    let error: any = formik.errors;

    for (const key of keys) {
      if (error && typeof error === "object" && key in error) {
        error = error[key];
      } else {
        return null;
      }
    }

    return typeof error === "string" ? error : null;
  };

  // Helper function to check if field is touched
  const isFieldTouched = (fieldPath: string) => {
    const keys = fieldPath.split(".");
    let touched: any = formik.touched;

    for (const key of keys) {
      if (touched && typeof touched === "object" && key in touched) {
        touched = touched[key];
      } else {
        return false;
      }
    }

    return Boolean(touched);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">User ID *</Label>
              <Input
                id="user"
                name="user"
                value={formik.values.user}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isEditMode}
                placeholder="Enter user ID"
                className={
                  formik.touched.user && formik.errors.user
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.user && formik.errors.user && (
                <p className="text-sm text-red-500">{formik.errors.user}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Store *</Label>
              <Select
                value={formik.values.store}
                onValueChange={(value: any) =>
                  formik.setFieldValue("store", value)
                }
                disabled={isEditMode}
              >
                <SelectTrigger
                  id="store"
                  className={
                    formik.touched.store && formik.errors.store
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.store && formik.errors.store && (
                <p className="text-sm text-red-500">{formik.errors.store}</p>
              )}
            </div>
          </div>

          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formik.values.status}
                onValueChange={(value: any) =>
                  formik.setFieldValue("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Products
            <Button
              type="button"
              variant="outline"
              disabled={isEditMode}
              size="sm"
              onClick={() => {
                const newProduct = {
                  product: "",
                  quantity: 1,
                };
                formik.setFieldValue("products", [
                  ...formik.values.products,
                  newProduct,
                ]);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormikProvider value={formik}>
            <FieldArray name="products">
              {({ remove }) => (
                <>
                  {formik.values.products.map((_, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium">
                          Product {index + 1}
                        </h4>
                        {formik.values.products.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isEditMode}
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`products.${index}.product`}>
                            Product *
                          </Label>
                          <Select
                            value={formik.values.products[index]?.product || ""}
                            onValueChange={(value: any) =>
                              formik.setFieldValue(
                                `products.${index}.product`,
                                value
                              )
                            }
                            disabled={isEditMode}
                          >
                            <SelectTrigger
                              id={`products.${index}.product`}
                              className={
                                isFieldTouched(`products.${index}.product`) &&
                                getFieldError(`products.${index}.product`)
                                  ? "border-red-500"
                                  : ""
                              }
                            >
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isFieldTouched(`products.${index}.product`) &&
                            getFieldError(`products.${index}.product`) && (
                              <p className="text-sm text-red-500">
                                {getFieldError(`products.${index}.product`)}
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`products.${index}.quantity`}>
                            Quantity *
                          </Label>
                          <Input
                            id={`products.${index}.quantity`}
                            name={`products.${index}.quantity`}
                            disabled={isEditMode}
                            type="number"
                            min="1"
                            value={formik.values.products[index]?.quantity || 1}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter quantity"
                            className={
                              isFieldTouched(`products.${index}.quantity`) &&
                              getFieldError(`products.${index}.quantity`)
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {isFieldTouched(`products.${index}.quantity`) &&
                            getFieldError(`products.${index}.quantity`) && (
                              <p className="text-sm text-red-500">
                                {getFieldError(`products.${index}.quantity`)}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </FieldArray>
          </FormikProvider>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingAddress.street">Street *</Label>
            <Input
              id="shippingAddress.street"
              disabled={isEditMode}
              name="shippingAddress.street"
              value={formik.values.shippingAddress.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter street address"
              className={
                formik.touched.shippingAddress?.street &&
                formik.errors.shippingAddress?.street
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.shippingAddress?.street &&
              formik.errors.shippingAddress?.street && (
                <p className="text-sm text-red-500">
                  {formik.errors.shippingAddress.street}
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.state">State *</Label>
              <Input
                id="shippingAddress.state"
                disabled={isEditMode}
                name="shippingAddress.state"
                value={formik.values.shippingAddress.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter state"
                className={
                  formik.touched.shippingAddress?.state &&
                  formik.errors.shippingAddress?.state
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.shippingAddress?.state &&
                formik.errors.shippingAddress?.state && (
                  <p className="text-sm text-red-500">
                    {formik.errors.shippingAddress.state}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress.city">City *</Label>
              <Input
                id="shippingAddress.city"
                name="shippingAddress.city"
                value={formik.values.shippingAddress.city}
                disabled={isEditMode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter city"
                className={
                  formik.touched.shippingAddress?.city &&
                  formik.errors.shippingAddress?.city
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.shippingAddress?.city &&
                formik.errors.shippingAddress?.city && (
                  <p className="text-sm text-red-500">
                    {formik.errors.shippingAddress.city}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.postalCode">Postal Code *</Label>
              <Input
                id="shippingAddress.postalCode"
                name="shippingAddress.postalCode"
                disabled={isEditMode}
                type="number"
                value={formik.values.shippingAddress.postalCode || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter postal code"
                className={
                  formik.touched.shippingAddress?.postalCode &&
                  formik.errors.shippingAddress?.postalCode
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.shippingAddress?.postalCode &&
                formik.errors.shippingAddress?.postalCode && (
                  <p className="text-sm text-red-500">
                    {formik.errors.shippingAddress.postalCode}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress.lng">Longitude *</Label>
              <Input
                id="shippingAddress.lng"
                name="shippingAddress.lng"
                disabled={isEditMode}
                type="number"
                step="any"
                value={formik.values.shippingAddress.lng || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter longitude"
                className={
                  formik.touched.shippingAddress?.lng &&
                  formik.errors.shippingAddress?.lng
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.shippingAddress?.lng &&
                formik.errors.shippingAddress?.lng && (
                  <p className="text-sm text-red-500">
                    {formik.errors.shippingAddress.lng}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress.lat">Latitude *</Label>
              <Input
                id="shippingAddress.lat"
                name="shippingAddress.lat"
                type="number"
                disabled={isEditMode}
                step="any"
                value={formik.values.shippingAddress.lat || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter latitude"
                className={
                  formik.touched.shippingAddress?.lat &&
                  formik.errors.shippingAddress?.lat
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.shippingAddress?.lat &&
                formik.errors.shippingAddress?.lat && (
                  <p className="text-sm text-red-500">
                    {formik.errors.shippingAddress.lat}
                  </p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formik.isValid}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditMode ? "Update Order" : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
