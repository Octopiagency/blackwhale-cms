"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import { getOrders } from "../../lib/apis/queries";
import { Edit, Plus, User, Package, MapPin, Clock } from "lucide-react";

import type { Order, OrdersResponse } from "../../types/order";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
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

export default function OrderListPage() {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const orderPrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "orders"
  ) as any;

  const canCreateOrder = orderPrivileges?.access_write === 1;
  const canEditOrder = orderPrivileges?.access_edit === 1;
  const canDeleteOrder = orderPrivileges?.access_delete === 1;
  const hasAnyActionPermission = canEditOrder || canDeleteOrder;

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    limit: 10,
    page: 1,
    term: "",
    status: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const { data: ordersData, isLoading: loadingDataOrders } =
    useQuery<OrdersResponse>({
      queryKey: ["orders-data", searchParamsToString(searchParams)],
      queryFn: () => getOrders({ params: searchParamsToString(searchParams) }),
      staleTime: Number.POSITIVE_INFINITY,
    });

  const orders: Order[] = ordersData?.data ?? [];
  console.log("orders : ", orders);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "preparing":
        return "outline";
      case "ready":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Table columns configuration
  const columns: TableColumn[] = [
    {
      key: "user",
      header: "Customer",
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40&query=${
                value?.firstName || "user"
              }`}
              alt={`${value?.firstName || ""} ${value?.lastName || ""}`}
            />
            <AvatarFallback>
              {value?.firstName?.[0]}
              {value?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {value?.firstName} {value?.lastName}
            </p>
            <p className="text-sm text-gray-500">{value?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {value?.length || 0} item
                  {(value?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 max-w-xs">
                {value?.map((product: any, index: number) => (
                  <p key={index} className="text-xs">
                    {product.title || "Product"} x
                    {product.orderQuantity || product.quantity || 1}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "shippingAddress",
      header: "Shipping Address",
      sortable: false,
      filterable: false,
      render: (value: any) => {
        console.log("value : ", value);

        return (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {value?.city}, {value?.street}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "subtotal",
      header: "Total",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ${value?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Order Date",
      sortable: true,
      filterable: false,
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ];

  // Navigation functions
  const handleCreateOrder = (): void => {
    navigate("/order/create");
  };

  const handleEditOrder = (record: Order): void => {
    navigate(`/order/create/${record._id}`);
  };

  // Action items for table
  const actionItems: ActionItem[] = [];

  // Add Edit action if user has permission
  if (canEditOrder) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditOrder(record);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEditOrder) {
      handleEditOrder(record);
    }
  };

  // Pagination configuration
  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: ordersData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.subtotal || 0),
    0
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer orders and track their status
          </p>
        </div>
        {canCreateOrder && (
          <Button
            onClick={handleCreateOrder}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOrders}
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
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingOrders}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Delivered Orders
              </p>
              <p className="text-2xl font-bold text-green-600">
                {deliveredOrders}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-purple-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        data={orders}
        columns={columns}
        isLoading={loadingDataOrders}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
}
