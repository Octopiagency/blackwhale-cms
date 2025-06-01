/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, type JSX } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash } from "lucide-react";

// Types
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import type {
  Category,
  CategoryFormData,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoriesResponse,
  DeleteCategoryRequest,
  CategoryTypeOption,
  CategoryStatusOption,
} from "../../types/category";
import type { ActionItem } from "../../types/table";

// Utils and APIs
import { searchParamsToString } from "../../lib/utils";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../lib/apis/queries";

// Components
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import DynamicTable from "../../components/DynamicTable";
import DynamicModal from "../../components/DynamicModal";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export default function CategoriesPage(): JSX.Element {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "categories"
  ) as any;

  const canCreate = storePrivileges?.access_write === 1;
  const canEdit = storePrivileges?.access_edit === 1;
  const canDelete = storePrivileges?.access_delete === 1;
  const hasAnyActionPermission = canEdit || canDelete;

  const [searchParams, setSearchParams] = useState<SearchParams>({
    limit: 10,
    page: 1,
    term: "",
    status: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const {
    data: categoriesData,
    isLoading: loadingData,
    refetch,
  } = useQuery<CategoriesResponse>({
    queryKey: ["categories", searchParamsToString(searchParams)],
    queryFn: () =>
      getCategories({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const categories: Category[] = categoriesData?.data ?? [];

  // Table columns configuration
  const columns: TableColumn[] = [
    {
      key: "title",
      header: "Title",
      filterable: true,
      sortable: true,
      render: (value: any) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      filterable: true,
      sortable: true,
      render: (value: any) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "image",
      header: "Image",
      filterable: false,
      sortable: false,
      render: (value: any["image"]) => (
        <div className="flex items-center">
          {value?.path ? (
            <img
              src={`${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
                value.path
              }`}
              alt="Category"
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "isActive",
      filterable: true,
      sortable: true,
      render: (value: any) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      filterable: true,
      sortable: true,
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Category type options
  const categoryTypeOptions: CategoryTypeOption[] = [
    { label: "Store", value: "store" },
    { label: "Restaurant", value: "restaurant" },
  ];

  // Status options
  const statusOptions: CategoryStatusOption[] = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  // Form fields configuration
  const fields: any[] = [
    {
      name: "title",
      label: "Title",
      type: "input",
      required: true,
      placeholder: "Enter category title",
      validation: {
        min: 2,
        max: 100,
        message: "Title must be between 2 and 100 characters",
      },
    },
    {
      name: "type",
      label: "Type",
      type: "dropdown",
      required: true,
      options: categoryTypeOptions,
    },
    {
      name: "image",
      label: "Image",
      type: "upload",
      required: false,
      accept: "image/*",
    },
    {
      name: "isActive",
      label: "Is Active",
      type: "dropdown",
      required: true,
      options: statusOptions,
    },
  ];

  // Prepare form data for editing
  const formData: CategoryFormData = selectedCategory
    ? {
        title: selectedCategory.title,
        type: selectedCategory.type,
        image: selectedCategory.image?.path || null,
        isActive: selectedCategory.isActive,
      }
    : {
        title: "",
        type: "",
        image: null,
        isActive: true,
      };

  const handleCreateCategory = (): void => {
    setSelectedCategory(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditCategory = (record: any): void => {
    setSelectedCategory(record);
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setIsEditMode(false);
  };

  const handleSubmit = (values: CategoryFormData | any): void => {
    const formData = new FormData();

    // Append text fields
    formData.append("title", values.title);
    formData.append("type", values.type);
    formData.append("isActive", values.isActive.toString());

    // Handle image upload
    if (values.image && values.image instanceof File) {
      formData.append("image", values.image);
    }

    if (isEditMode && selectedCategory) {
      // Add ID for update
      formData.append("category_id", selectedCategory._id);
      updateMutate(formData as unknown as CategoryUpdateRequest);
    } else {
      createMutate(formData as unknown as CategoryCreateRequest);
    }

    handleCloseModal();
  };

  const handleDeleteCategory = (record: any): void => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutate({ id: record._id });
    }
  };
  const actionItems: ActionItem[] = [];
  if (canEdit) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditCategory(record);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  // Add Delete action if user has permission
  if (canDelete) {
    actionItems.push({
      label: "Delete",
      onClick: (record: any) => {
        handleDeleteCategory(record);
      },
      icon: <Trash className="w-5 h-5 text-destructive" />,
    });
  }

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEdit) {
      handleEditCategory(record);
    }
  };

  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: categoriesData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Mutations
  const { mutate: createMutate, isPending: isPendingCreate } = useMutation<
    Category,
    Error,
    CategoryCreateRequest
  >({
    mutationFn: (values: CategoryCreateRequest) => addCategory(values),
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Create category error:", error);
    },
  });

  const { mutate: updateMutate, isPending: isPendingUpdate } = useMutation<
    Category,
    Error,
    CategoryUpdateRequest
  >({
    mutationFn: (values: CategoryUpdateRequest) => updateCategory(values),
    onSuccess: () => {
      refetch();
      // TODO: Add toast success message
      console.log("Category updated successfully");
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Update category error:", error);
    },
  });

  const { mutate: deleteMutate, isPending: isPendingDelete } = useMutation<
    void,
    Error,
    DeleteCategoryRequest
  >({
    mutationFn: (variables: DeleteCategoryRequest) =>
      deleteCategory(variables.id),
    onSuccess: () => {
      refetch();
      // TODO: Add toast success message
      console.log("Category deleted successfully");
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Delete category error:", error);
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white"></h1>
        {canCreate && (
          <Button
            onClick={handleCreateCategory}
            className="flex items-center gap-2"
            disabled={isPendingCreate}
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        )}
      </div>

      <DynamicTable
        data={categories}
        columns={columns}
        isLoading={loadingData}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />

      <DynamicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? "Edit Category" : "Create New Category"}
        fields={fields}
        data={formData}
        isEditMode={isEditMode}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? "Update" : "Create"}
        isLoading={isPendingCreate || isPendingUpdate || isPendingDelete}
      />
    </div>
  );
}
