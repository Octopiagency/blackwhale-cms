"use client";

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { OrderFormValues } from "../../types/order";
import { useOrderForm } from "../../hooks/use-order-form";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import OrderForm from "./order-form";
import { useQuery } from "@tanstack/react-query";
import type { ProductsResponse } from "../products/products-list";
import { searchParamsToString } from "../../lib/utils";
import { getProducts, getStores } from "../../lib/apis/queries";
import type { StoresResponse } from "../../types/store";

export default function CreateOrderPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    orderData,
    isLoadingOrder,
    orderError,
    createMutation,
    updateMutation,
    isEditMode,
  } = useOrderForm(id);

  const { data: productsData, isLoading: loadingDataProducts } =
    useQuery<ProductsResponse>({
      queryKey: ["products-data", searchParamsToString({ limit: 500 })],
      queryFn: () =>
        getProducts({ params: searchParamsToString({ limit: 500 }) }),
      staleTime: Number.POSITIVE_INFINITY,
    });

  const { data: storesData, isLoading: loadingDataStores } =
    useQuery<StoresResponse>({
      queryKey: ["stores-data", searchParamsToString({ limit: 500 })],
      queryFn: () =>
        getStores({ params: searchParamsToString({ limit: 500 }) }),
      staleTime: Number.POSITIVE_INFINITY,
    });

  const handleSubmit = (values: OrderFormValues) => {
    const payload = {
      user_id: values.user,
      products: values.products,
      shippingAddress: values.shippingAddress,
      store: values.store,
      ...(isEditMode && values.status && { status: values.status }),
    };

    if (isEditMode && id) {
      updateMutation.mutate({
        order_id: id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoadingOrder || loadingDataProducts || loadingDataStores) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading order data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load order data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8 justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Order" : "Create New Order"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode
              ? "Update the order information below"
              : "Fill in the details to create a new order"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/order/list")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Button>
      </div>

      {/* Form */}
      <OrderForm
        initialData={orderData?.order}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isEditMode={isEditMode}
        storesData={storesData?.data}
        productsData={productsData?.data}
      />
    </div>
  );
}
