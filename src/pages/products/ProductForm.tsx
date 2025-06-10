/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { ProductFormValues } from "../../types/product";
import { useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import {
  getCategories,
  getStores,
  getSubCategories,
} from "../../lib/apis/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { Store } from "../../types/store";
import type { CategoriesResponse, Category } from "../../types/category";
import type {
  SubCategoriesResponse,
  SubCategory,
} from "../../types/sub-category";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  weight: Yup.string().required("Weight is required"),
  basePrice: Yup.string().required("Base price is required"),
  discount: Yup.string().required("Discount is required"),
  category: Yup.string().required("Category is required"),
  type: Yup.string().required("Type is required"),
  store: Yup.string().required("Store is required"),
});

const getImageUrl = (image: File | string | { path: string }) => {
  if (typeof image === "string") {
    return `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${image}`;
  } else if (image instanceof File) {
    return URL.createObjectURL(image);
  } else if (image && typeof image === "object" && "path" in image) {
    return `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${image.path}`;
  }
  return "";
};

interface ProductFormProps {
  initialData?: Partial<ProductFormValues> | any;
  onSubmit: (values: ProductFormValues) => void;
  isLoading: boolean;
  isEditMode: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
}: ProductFormProps) {
  const { data: StoresData } = useQuery({
    queryKey: ["stores", searchParamsToString({ limit: 500 })],
    queryFn: () => getStores({ params: searchParamsToString({ limit: 500 }) }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ["categories", searchParamsToString({ limit: 500 })],
    queryFn: () =>
      getCategories({ params: searchParamsToString({ limit: 500 }) }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: subCategoriesData } = useQuery<SubCategoriesResponse>({
    queryKey: ["sub-categories", searchParamsToString({ limit: 500 })],
    queryFn: () =>
      getSubCategories({ params: searchParamsToString({ limit: 500 }) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const subCategories: SubCategory[] = subCategoriesData?.data ?? [];

  // Update the initialValues section in the formik setup
  const formik = useFormik<ProductFormValues>({
    initialValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      images: initialData?.images || [],
      weight: initialData?.weight || "",
      basePrice: initialData?.basePrice || "",
      subcategory: initialData?.subcategory?._id || "",
      discount: initialData?.discount || "",
      category: initialData?.category?._id || "",
      addons: Array.isArray(initialData?.addons)
        ? initialData.addons.map((addon: any) => {
            // Check if addon is an array (from the API) or already in the expected format
            if (Array.isArray(addon)) {
              // Convert from API format to form format
              return {
                name: addon[0]?.name || "",
                type: addon[0]?.type || "",
                options: Array.isArray(addon[0]?.options)
                  ? addon[0].options.map(
                      (option: { name: string; priceModification: any }) => ({
                        name: option.name || "",
                        priceModification: option.priceModification || "",
                      })
                    )
                  : [
                      {
                        name: "",
                        priceModification: "",
                      },
                    ],
              };
            } else {
              // Already in the expected format or close to it
              return {
                name: addon.name || "",
                type: addon.type || "",
                options: Array.isArray(addon.options)
                  ? addon.options.map((option: any) => ({
                      name: option.name || "",
                      priceModification: option.priceModification || "",
                    }))
                  : [
                      {
                        name: "",
                        priceModification: "",
                      },
                    ],
              };
            }
          })
        : [
            {
              name: "",
              type: "",
              options: [
                {
                  name: "",
                  priceModification: "",
                },
              ],
            },
          ],
      type: initialData?.type || "",
      store: initialData?.store?._id || "",
      outOfStock: initialData?.outOfStock || false,
      isActive: initialData?.isActive || true,
    },
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const addAddon = () => {
    const newAddon = {
      name: "",
      type: "",
      options: [
        {
          name: "",
          priceModification: "",
        },
      ],
    };
    formik.setFieldValue("addons", [...formik.values.addons, newAddon]);
  };

  const removeAddon = (index: number) => {
    const newAddons = formik.values.addons.filter((_, i) => i !== index);
    formik.setFieldValue("addons", newAddons);
  };

  const addOption = (addonIndex: number) => {
    const newOption = {
      name: "",
      priceModification: "",
    };
    const newAddons = [...formik.values.addons];
    newAddons[addonIndex].options.push(newOption);
    formik.setFieldValue("addons", newAddons);
  };

  const removeOption = (addonIndex: number, optionIndex: number) => {
    const newAddons = [...formik.values.addons];
    newAddons[addonIndex].options = newAddons[addonIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    formik.setFieldValue("addons", newAddons);
  };

  const removeImage = (index: number) => {
    const newImages = formik.values.images.filter((_, i) => i !== index);
    formik.setFieldValue("images", newImages);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter product title"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter product description"
                rows={4}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.description}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="images">Product Images</Label>
              <Input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  formik.setFieldValue("images", [
                    ...formik.values.images,
                    ...files,
                  ]);
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/40"
              />

              {/* Image Preview Grid */}
              {formik.values.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {formik.values.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={getImageUrl(image) || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Delete button on hover */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                name="weight"
                value={formik.values.weight}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter weight"
              />
            </div>

            <div>
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                step="0.01"
                value={formik.values.basePrice}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter base price"
              />
            </div>

            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                value={formik.values.discount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter discount"
              />
            </div>

            <div>
              <Label htmlFor="Category">Category</Label>
              <Select
                value={formik.values.category}
                onValueChange={(value) =>
                  formik.setFieldValue("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.data?.map((category: Category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.category}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="subcategory">Sub Category</Label>
              <Select
                value={formik.values.subcategory}
                onValueChange={(value) =>
                  formik.setFieldValue("subcategory", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories?.map((subcategory: SubCategory) => (
                    <SelectItem key={subcategory._id} value={subcategory._id}>
                      {subcategory.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.subcategory && formik.errors.subcategory && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.subcategory}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Addons Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Addons</CardTitle>
            <Button type="button" onClick={addAddon} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Addon
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formik.values.addons.map((addon, addonIndex) => (
            <Card key={addonIndex} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Addon {addonIndex + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAddon(addonIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`addons.${addonIndex}.name`}>
                      Addon Name
                    </Label>
                    <Input
                      id={`addons.${addonIndex}.name`}
                      name={`addons.${addonIndex}.name`}
                      value={addon.name}
                      onChange={formik.handleChange}
                      placeholder="Enter addon name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`addons.${addonIndex}.type`}>
                      Addon Type
                    </Label>
                    <Select
                      value={addon.type}
                      onValueChange={(value) =>
                        formik.setFieldValue(`addons.${addonIndex}.type`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select addon type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="remove">Remove</SelectItem>
                        <SelectItem value="choose">Choose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Options</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(addonIndex)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  {addon.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Input
                        name={`addons.${addonIndex}.options.${optionIndex}.name`}
                        value={option.name}
                        onChange={formik.handleChange}
                        placeholder="Option name"
                        className="flex-1"
                      />
                      <Input
                        name={`addons.${addonIndex}.options.${optionIndex}.priceModification`}
                        value={option.priceModification}
                        onChange={formik.handleChange}
                        placeholder="Price modification"
                        type="number"
                        step="0.01"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(addonIndex, optionIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formik.values.type}
                onValueChange={(value) => formik.setFieldValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.type && formik.errors.type && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.type}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="store">Store</Label>
              <Select
                value={formik.values.store}
                onValueChange={(value) => formik.setFieldValue("store", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {StoresData?.data?.map((store: Store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.store && formik.errors.store && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.store}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="outOfStock"
                checked={formik.values.outOfStock}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("outOfStock", checked)
                }
              />
              <Label htmlFor="outOfStock">Out of Stock</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formik.values.isActive}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Is Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isEditMode ? "Updating..." : "Creating..."}</span>
            </div>
          ) : (
            <span>{isEditMode ? "Update Product" : "Create Product"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
