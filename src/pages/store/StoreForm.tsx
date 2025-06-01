"use client";

import type React from "react";

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
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Loader2, Upload, X, Plus, Trash } from "lucide-react";
import { useState } from "react";
import type { Store, StoreFormValues } from "../../types/store";

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (values: StoreFormValues) => void;
  isLoading: boolean;
  isEditMode: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
  address: Yup.array()
    .of(
      Yup.object({
        state: Yup.string().required("State is required"),
        city: Yup.string().required("City is required"),
        street: Yup.string().required("Street is required"),
        postalCode: Yup.string().required("Postal code is required"),
        lng: Yup.string().required("Longitude is required"),
        lat: Yup.string().required("Latitude is required"),
      })
    )
    .min(1, "At least one address is required"),
  phone: Yup.object({
    code: Yup.string().required("Phone code is required"),
    number: Yup.string().required("Phone number is required"),
  }),
  type: Yup.string().required("Type is required"),
  rating: Yup.string().required("Rating is required"),
});

export default function StoreForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
}: StoreFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image?.path
      ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
          initialData.image.path
        }`
      : null
  );

  const formik = useFormik<StoreFormValues>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      address: initialData?.address || [
        {
          state: "",
          city: "",
          street: "",
          postalCode: "",
          lng: "",
          lat: "",
        },
      ],
      phone: initialData?.phone || {
        code: "",
        number: "",
      },
      type: initialData?.type || "",
      rating: initialData?.rating || "",
      image: null,
      isActive: initialData?.isActive ?? true,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(null);
  };

  const storeTypes = [
    { value: "store", label: "Store" },
    { value: "restaurant", label: "Restaurant" },
  ];

  const ratings = [
    { value: "1", label: "1 Star" },
    { value: "2", label: "2 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "5", label: "5 Stars" },
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter store title"
                className={
                  formik.touched.title && formik.errors.title
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500">{formik.errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formik.values.type}
                onValueChange={(value) => formik.setFieldValue("type", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.type && formik.errors.type
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select store type" />
                </SelectTrigger>
                <SelectContent>
                  {storeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.type && formik.errors.type && (
                <p className="text-sm text-red-500">{formik.errors.type}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter store description"
              rows={4}
              className={
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500">
                {formik.errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <Select
                value={formik.values.rating}
                onValueChange={(value) => formik.setFieldValue("rating", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.rating && formik.errors.rating
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.rating && formik.errors.rating && (
                <p className="text-sm text-red-500">{formik.errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formik.values.isActive}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("isActive", checked)
                  }
                />
                <Label htmlFor="isActive" className="text-sm">
                  {formik.values.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Address Information
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newAddress = {
                  state: "",
                  city: "",
                  street: "",
                  postalCode: "",
                  lng: "",
                  lat: "",
                };
                formik.setFieldValue("address", [
                  ...formik.values.address,
                  newAddress,
                ]);
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Address</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormikProvider value={formik}>
            <FieldArray name="address">
              {({ remove }) => (
                <>
                  {formik.values.address.map((address, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium">
                          Address {index + 1}
                        </h4>
                        {formik.values.address.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`address.${index}.state`}>
                            State *
                          </Label>
                          <Input
                            id={`address.${index}.state`}
                            name={`address.${index}.state`}
                            value={formik.values.address[index]?.state || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter state"
                            className={
                              formik.touched.address?.[index]?.state &&
                              formik.errors.address?.[index]?.state
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.address?.[index]?.state &&
                            formik.errors.address?.[index]?.state && (
                              <p className="text-sm text-red-500">
                                {formik.errors.address[index].state}
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`address.${index}.city`}>
                            City *
                          </Label>
                          <Input
                            id={`address.${index}.city`}
                            name={`address.${index}.city`}
                            value={formik.values.address[index]?.city || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter city"
                            className={
                              formik.touched.address?.[index]?.city &&
                              formik.errors.address?.[index]?.city
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.address?.[index]?.city &&
                            formik.errors.address?.[index]?.city && (
                              <p className="text-sm text-red-500">
                                {formik.errors.address[index].city}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`address.${index}.street`}>
                          Street *
                        </Label>
                        <Input
                          id={`address.${index}.street`}
                          name={`address.${index}.street`}
                          value={formik.values.address[index]?.street || ""}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter street address"
                          className={
                            formik.touched.address?.[index]?.street &&
                            formik.errors.address?.[index]?.street
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {formik.touched.address?.[index]?.street &&
                          formik.errors.address?.[index]?.street && (
                            <p className="text-sm text-red-500">
                              {formik.errors.address[index].street}
                            </p>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`address.${index}.postalCode`}>
                            Postal Code *
                          </Label>
                          <Input
                            id={`address.${index}.postalCode`}
                            name={`address.${index}.postalCode`}
                            value={
                              formik.values.address[index]?.postalCode || ""
                            }
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter postal code"
                            className={
                              formik.touched.address?.[index]?.postalCode &&
                              formik.errors.address?.[index]?.postalCode
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.address?.[index]?.postalCode &&
                            formik.errors.address?.[index]?.postalCode && (
                              <p className="text-sm text-red-500">
                                {formik.errors.address[index].postalCode}
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`address.${index}.lng`}>
                            Longitude *
                          </Label>
                          <Input
                            id={`address.${index}.lng`}
                            name={`address.${index}.lng`}
                            value={formik.values.address[index]?.lng || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter longitude"
                            className={
                              formik.touched.address?.[index]?.lng &&
                              formik.errors.address?.[index]?.lng
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.address?.[index]?.lng &&
                            formik.errors.address?.[index]?.lng && (
                              <p className="text-sm text-red-500">
                                {formik.errors.address[index].lng}
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`address.${index}.lat`}>
                            Latitude *
                          </Label>
                          <Input
                            id={`address.${index}.lat`}
                            name={`address.${index}.lat`}
                            value={formik.values.address[index]?.lat || ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter latitude"
                            className={
                              formik.touched.address?.[index]?.lat &&
                              formik.errors.address?.[index]?.lat
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formik.touched.address?.[index]?.lat &&
                            formik.errors.address?.[index]?.lat && (
                              <p className="text-sm text-red-500">
                                {formik.errors.address[index].lat}
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

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone.code">Phone Code *</Label>
              <Input
                id="phone.code"
                name="phone.code"
                value={formik.values.phone.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., +1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone.number">Phone Number *</Label>
              <Input
                id="phone.number"
                name="phone.number"
                value={formik.values.phone.number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Store Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Upload Image</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Image</span>
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
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
          {isEditMode ? "Update Store" : "Create Store"}
        </Button>
      </div>
    </form>
  );
}
