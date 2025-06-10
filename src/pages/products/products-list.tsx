"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Edit,
  Plus,
  Trash,
  Package,
  DollarSign,
  Star,
  ShoppingCart,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import DynamicTable from "../../components/DynamicTable";
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import { searchParamsToString } from "../../lib/utils";
import { deleteProduct, getProducts } from "../../lib/apis/queries";
import type { ActionItem } from "../../types/table";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export interface Product {
  _id: string;
  title: string;
  description: string;
  images: { path: string; _id: string }[];
  weight: number;
  basePrice: number;
  discount: number;
  price: number;
  category: string;
  type: string;
  store: {
    _id: string;
    title: string;
    type: string;
  };
  isActive: boolean;
  outOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  totalCount: number;
}

interface DeleteProductRequest {
  id: string;
}

export default function ProductListPage() {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "products"
  ) as any;

  const canCreate = storePrivileges?.access_write === 1;
  const canEdit = storePrivileges?.access_edit === 1;
  const canDelete = storePrivileges?.access_delete === 1;
  const hasAnyActionPermission = canEdit || canDelete;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    limit: 10,
    page: 1,
    term: "",
    status: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const {
    data: productsData,
    isLoading: loadingDataProducts,
    refetch,
  } = useQuery<ProductsResponse>({
    queryKey: ["products-data", searchParamsToString(searchParams)],
    queryFn: () => getProducts({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const products: Product[] = productsData?.data ?? [];

  // Table columns configuration
  const columns: TableColumn[] = [
    // {
    //   key: "images",
    //   header: "Image",
    //   sortable: false,
    //   filterable: false,
    //   render: (value: any) => (
    //     <Avatar className="w-12 h-12">
    //       <AvatarImage
    //         src={
    //           value?.[0]?.path
    //             ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
    //                 value[0].path
    //               }`
    //             : "/placeholder.svg?height=48&width=48"
    //         }
    //         alt="product"
    //       />
    //     </Avatar>
    //   ),
    // },
    {
      key: "title",
      header: "Product Name",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      filterable: false,
      render: (value: any) => {
        return (
          <Badge variant="outline" className="capitalize">
            {value?.title || "Uncategorized"}
          </Badge>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "store",
      header: "Store",
      sortable: false,
      filterable: false,
      render: (value: any) => {
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {value?.title || "No store"}
            </p>
          </div>
        );
      },
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-medium">
              ${value?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "weight",
      header: "Weight",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value}g
        </span>
      ),
    },
    {
      key: "outOfStock",
      header: "Stock",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <Badge
          className="whitespace-nowrap"
          variant={value ? "destructive" : "default"}
        >
          {value ? "Out of Stock" : "In Stock"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <Badge
          className="whitespace-nowrap"
          variant={value ? "default" : "destructive"}
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Navigation functions
  const handleCreateProduct = (): void => {
    navigate("/products/create");
  };

  const handleEditProduct = (record: Product): void => {
    navigate(`/products/create/${record._id}`);
  };

  const handleDeleteProduct = (record: Product): void => {
    if (window.confirm(`Are you sure you want to delete "${record.title}"?`)) {
      deleteMutate({ id: record._id });
    }
  };

  const actionItems: ActionItem[] = [];
  if (canEdit) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditProduct(record);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  // Add Delete action if user has permission
  if (canDelete) {
    actionItems.push({
      label: "Delete",
      onClick: (record: any) => {
        handleDeleteProduct(record);
      },
      icon: <Trash className="w-5 h-5 text-destructive" />,
    });
  }

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEdit) {
      handleEditProduct(record);
    }
  };

  // Pagination configuration
  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: productsData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Delete mutation
  const { mutate: deleteMutate } = useMutation<
    void,
    Error,
    DeleteProductRequest
  >({
    mutationFn: (variables: DeleteProductRequest) =>
      deleteProduct(variables.id),
    onSuccess: () => {
      refetch();
      console.log("Product deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Delete product error:", error);
    },
  });

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.isActive).length;
  const outOfStockProducts = products.filter(
    (product) => product.outOfStock
  ).length;
  const averagePrice =
    products.length > 0
      ? products.reduce((acc, product) => acc + (product.price || 0), 0) /
        products.length
      : 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleCreateProduct}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalProducts}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Products
              </p>
              <p className="text-2xl font-bold text-green-600">
                {activeProducts}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-red-600">
                {outOfStockProducts}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Price
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                ${averagePrice.toFixed(2)}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        data={products}
        columns={columns}
        isLoading={loadingDataProducts}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
}
