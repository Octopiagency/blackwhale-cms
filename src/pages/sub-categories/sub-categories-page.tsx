/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, type JSX } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash } from "lucide-react";

// Types
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import type {
  SubCategory,
  SubCategoryFormData,
  SubCategoryCreateRequest,
  SubCategoryUpdateRequest,
  SubCategoriesResponse,
  DeleteSubCategoryRequest,
  SubCategoryStatusOption,
} from "../../types/sub-category";
import type { ActionItem } from "../../types/table";

// Utils and APIs
import { searchParamsToString } from "../../lib/utils";
import {
  addSubCategory,
  deleteSubCategory,
  getStores,
  getSubCategories,
  updateSubCategory,
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
import type { StoresResponse } from "../../types/store";

export default function SubCategories(): JSX.Element {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "subcategories"
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
  const [selectedCategory, setSelectedCategory] = useState<SubCategory | null>(
    null
  );
  const { data: storesData } = useQuery<StoresResponse>({
    queryKey: ["stores-data", searchParamsToString(searchParams)],
    queryFn: () => getStores({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const stores = storesData?.data || [];

  const getStoreName = (storeId: string): string => {
    const store = stores.find((s) => s._id === storeId);
    return store?.title ?? "Unknown";
  };

  const {
    data: subCategoriesData,
    isLoading: loadingData,
    refetch,
  } = useQuery<SubCategoriesResponse>({
    queryKey: ["sub-categories", searchParamsToString(searchParams)],
    queryFn: () =>
      getSubCategories({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const subCategories: SubCategory[] = subCategoriesData?.data ?? [];

  const subCategoriesProccessed = subCategories.map((subCategory) => ({
    title: subCategory.title,
    store: subCategory.store,
    storeName: getStoreName(subCategory.store),
    updatedAt: subCategory.updatedAt,
    isActive: subCategory.isActive,
    createdAt: subCategory.createdAt,
    _id: subCategory._id,
  }));

  const processedStores = stores.map((store) => ({
    label: store.title,
    value: store._id,
  }));
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
      key: "storeName",
      header: "Store",
      filterable: true,
      sortable: true,
      render: (value: any) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
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

  // Status options
  const statusOptions: SubCategoryStatusOption[] = [
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
      name: "store",
      label: "Store",
      type: "dropdown",
      required: true,
      options: processedStores,
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
  const formData: SubCategoryFormData = selectedCategory
    ? {
        title: selectedCategory.title,
        store: selectedCategory.store,
        isActive: selectedCategory.isActive,
      }
    : {
        title: "",
        store: "",
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

  const handleSubmit = (values: SubCategoryFormData | any): void => {
    console.log("selectedCategory : ", selectedCategory);

    const processedValues = {
      ...values,
      isActive: values.isActive === "true" || values.isActive === true,
    };
    const processedEditValues = {
      ...values,
      isActive: values.isActive === "true" || values.isActive === true,
      subcategory_id: selectedCategory?._id,
    };

    if (isEditMode && selectedCategory) {
      updateMutate(processedEditValues as SubCategoryUpdateRequest);
    } else {
      createMutate(processedValues as SubCategoryCreateRequest);
    }
  };

  const handleDeleteCategory = (record: any): void => {
    if (window.confirm("Are you sure you want to delete this sub-category?")) {
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
    totalItems: subCategoriesData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Mutations
  const { mutate: createMutate, isPending: isPendingCreate } = useMutation<
    SubCategory,
    Error,
    SubCategoryCreateRequest
  >({
    mutationFn: (values: SubCategoryCreateRequest) => addSubCategory(values),
    onSuccess: () => {
      refetch();
      handleCloseModal();
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Create Sub-Category error:", error);
    },
  });

  const { mutate: updateMutate, isPending: isPendingUpdate } = useMutation<
    SubCategory,
    Error,
    SubCategoryUpdateRequest
  >({
    mutationFn: (values: SubCategoryUpdateRequest) => updateSubCategory(values),
    onSuccess: () => {
      refetch();
      // TODO: Add toast success message
      console.log("Sub-Category updated successfully");
      handleCloseModal();
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Update Sub-category error:", error);
    },
  });

  const { mutate: deleteMutate, isPending: isPendingDelete } = useMutation<
    void,
    Error,
    DeleteSubCategoryRequest
  >({
    mutationFn: (variables: DeleteSubCategoryRequest) =>
      deleteSubCategory(variables.id),
    onSuccess: () => {
      refetch();
      // TODO: Add toast success message
      console.log("Sub-Category deleted successfully");
      handleCloseModal();
    },
    onError: (error: Error) => {
      // TODO: Add toast error message
      console.error("Delete Sub-category error:", error);
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
            Add Sub Category
          </Button>
        )}
      </div>

      <DynamicTable
        data={subCategoriesProccessed}
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
        title={isEditMode ? "Edit Sub Category" : "Create New Sub Category"}
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
