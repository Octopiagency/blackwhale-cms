"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import ProductForm from "./ProductForm";
import type { ProductFormValues } from "../../types/product";
import { useProductForm } from "../../hooks/useProductForm";

export default function CreateProductPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    productData,
    isLoadingProduct,
    productError,
    createMutation,
    updateMutation,
    isEditMode,
  } = useProductForm(id);

  const handleSubmit = (values: ProductFormValues) => {
    const formData = new FormData();

    // Append basic fields
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("weight", values.weight);
    formData.append("basePrice", values.basePrice);
    formData.append("discount", values.discount);
    formData.append("category", values.category);
    formData.append("type", values.type);
    formData.append("store", values.store);
    formData.append("outOfStock", values.outOfStock.toString());
    formData.append("isActive", values.isActive.toString());

    // Append images
    values.images.forEach((image, index) => {
      formData.append(`images[${index}][path]`, image);
    });

    // Append addons with their nested structure
    values.addons.forEach((addon, addonIndex) => {
      formData.append(`addons[${addonIndex}][name]`, addon.name);
      formData.append(`addons[${addonIndex}][type]`, addon.type);

      addon.options.forEach((option, optionIndex) => {
        formData.append(
          `addons[${addonIndex}][options][${optionIndex}][name]`,
          option.name
        );
        formData.append(
          `addons[${addonIndex}][options][${optionIndex}][priceModification]`,
          option.priceModification
        );
      });
    });

    if (isEditMode && id) {
      formData.append("product_id", id);
      updateMutation.mutate(formData as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading product data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load product data. Please try again later.
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
            {isEditMode ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode
              ? "Update the product information below"
              : "Fill in the details to create a new product"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/products/list")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Button>
      </div>

      {/* Form */}
      <ProductForm
        initialData={productData?.product}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isEditMode={isEditMode}
      />
    </div>
  );
}
