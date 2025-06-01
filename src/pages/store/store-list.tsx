/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import { getStores, deleteStore } from "../../lib/apis/queries";
import { Edit, Plus, Trash, MapPin, Phone, Star } from "lucide-react";

import type {
  Store,
  StoresResponse,
  DeleteStoreRequest,
} from "../../types/store";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarImage } from "../../components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import DynamicTable from "../../components/DynamicTable";
import type { ActionItem } from "../../types/table";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export default function StoreListPage() {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "stores"
  ) as any;

  const canCreateStore = storePrivileges?.access_write === 1;
  const canEditStore = storePrivileges?.access_edit === 1;
  const canDeleteStore = storePrivileges?.access_delete === 1;
  const hasAnyActionPermission = canEditStore || canDeleteStore;

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
    data: storesData,
    isLoading: loadingDataStores,
    refetch,
  } = useQuery<StoresResponse>({
    queryKey: ["stores-data", searchParamsToString(searchParams)],
    queryFn: () => getStores({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const stores: Store[] = storesData?.data ?? [];

  // Table columns configuration
  const columns: TableColumn[] = [
    {
      key: "image",
      header: "Image",
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={
              value?.path
                ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
                    value.path
                  }`
                : "/placeholder.svg?height=48&width=48&query=store"
            }
            alt={"image"}
          />
        </Avatar>
      ),
    },
    {
      key: "title",
      header: "Store Name",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <div className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
      ),
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
      key: "address",
      header: "Location",
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value[0]?.city || "No address"}
                  {value.length > 1 && ` +${value.length - 1} more`}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {value.map((addr: any, index: number) => (
                  <p key={index} className="text-xs">
                    {addr.street}, {addr.city}, {addr.state}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            +{value.code} {value.number}
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{value || "0"}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <Badge variant={value ? "default" : "destructive"}>
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
  const handleCreateStore = (): void => {
    navigate("/store/create");
  };

  const handleEditStore = (record: Store): void => {
    navigate(`/store/create/${record._id}`);
  };

  const handleDeleteStore = (record: Store): void => {
    if (window.confirm(`Are you sure you want to delete "${record.title}"?`)) {
      deleteMutate({ id: record._id });
    }
  };

  // Action items for table
  const actionItems: ActionItem[] = [];

  // Add Edit action if user has permission
  if (canEditStore) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditStore(record);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  // Add Delete action if user has permission
  if (canDeleteStore) {
    actionItems.push({
      label: "Delete",
      onClick: (record: any) => {
        handleDeleteStore(record);
      },
      icon: <Trash className="w-5 h-5 text-destructive" />,
    });
  }

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEditStore) {
      handleEditStore(record);
    }
  };

  // Pagination configuration
  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: storesData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Delete mutation
  const { mutate: deleteMutate } = useMutation<void, Error, DeleteStoreRequest>(
    {
      mutationFn: (variables: DeleteStoreRequest) => deleteStore(variables.id),
      onSuccess: () => {
        refetch();
        // TODO: Add toast success message
        console.log("Store deleted successfully");
      },
      onError: (error: Error) => {
        // TODO: Add toast error message
        console.error("Delete store error:", error);
      },
    }
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stores Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your store locations and information
          </p>
        </div>
        {canCreateStore && (
          <Button
            onClick={handleCreateStore}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Store
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Stores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stores.length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Stores
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stores.filter((store) => store.isActive).length}
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
                Restaurants
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stores.filter((store) => store.type === "restaurant").length}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stores.length > 0
                  ? (
                      stores.reduce(
                        (acc, store) => acc + (store.rating || 0),
                        0
                      ) / stores.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        data={stores}
        columns={columns}
        isLoading={loadingDataStores}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
}
