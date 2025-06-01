/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { StoreFormValues } from "../../types/store";
import { useStoreForm } from "../../hooks/useStoreForm";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import StoreForm from "./StoreForm";

export default function CreateStorePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    storeData,
    isLoadingStore,
    storeError,
    createMutation,
    updateMutation,
    isEditMode,
  } = useStoreForm(id);
  const handleSubmit = (values: StoreFormValues) => {
    const formData = new FormData();

    // Append basic fields
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("type", values.type);
    formData.append("rating", values.rating);
    formData.append("isActive", values.isActive.toString());

    values.address.forEach((addr, index) => {
      formData.append(`address[${index}][state]`, addr.state);
      formData.append(`address[${index}][city]`, addr.city);
      formData.append(`address[${index}][street]`, addr.street);
      formData.append(`address[${index}][postalCode]`, addr.postalCode);
      formData.append(`address[${index}][lng]`, addr.lng);
      formData.append(`address[${index}][lat]`, addr.lat);
    });

    // Phone (assuming it's just one object)
    formData.append("phone[code]", values.phone.code as any);
    formData.append("phone[number]", values.phone.number as any);

    // Append image if present
    if (values.image) {
      formData.append("image", values.image);
    }

    if (isEditMode && id) {
      formData.append("store_id", id);
      updateMutation.mutate(formData as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  if (isLoadingStore) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading store data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load store data. Please try again later.
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
            {isEditMode ? "Edit Store" : "Create New Store"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode
              ? "Update the store information below"
              : "Fill in the details to create a new store"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/store/list")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stores</span>
        </Button>
      </div>

      {/* Form */}
      <StoreForm
        initialData={storeData?.store}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isEditMode={isEditMode}
      />
    </div>
  );
}
