"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import type { Pagination, SearchParams, TableColumn } from "../../types/admin";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import { getUsers, deleteUser } from "../../lib/apis/queries";
import { Edit, Plus, Trash, User, Mail, Phone, Calendar } from "lucide-react";

import type {
  User as UserType,
  UsersResponse,
  DeleteUserRequest,
} from "../../types/user";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import DynamicTable from "../../components/DynamicTable";
import type { ActionItem } from "../../types/table";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export default function UserListPage() {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const userPrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "users"
  ) as any;

  const canCreateUser = userPrivileges?.access_write === 1;
  const canEditUser = userPrivileges?.access_edit === 1;
  const canDeleteUser = userPrivileges?.access_delete === 1;
  const hasAnyActionPermission = canEditUser || canDeleteUser;

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
    data: usersData,
    isLoading: loadingDataUsers,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ["users-data", searchParamsToString(searchParams)],
    queryFn: () => getUsers({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const users: UserType[] = usersData?.data ?? [];

  // Get gender badge variant
  const getGenderVariant = (gender: string) => {
    switch (gender) {
      case "male":
        return "default";
      case "female":
        return "secondary";
      case "other":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Table columns configuration
  const columns: TableColumn[] = [
    {
      key: "image",
      header: "Avatar",
      sortable: false,
      filterable: false,
      render: (value: any, record: any) => (
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={
              value?.path
                ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
                    value.path
                  }`
                : `/placeholder.svg?height=48&width=48&query=${record.firstName}`
            }
            alt={`${record.firstName} ${record.lastName}`}
          />
          <AvatarFallback>
            {record.firstName?.[0]}
            {record.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "firstName",
      header: "Name",
      sortable: true,
      filterable: false,
      render: (_record: any, value: any) => {
        return (
          <div className="space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {value.firstName} {value.lastName}
            </p>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-500">{value.email}</span>
            </div>
          </div>
        );
      },
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
      key: "gender",
      header: "Gender",
      sortable: true,
      filterable: true,
      render: (value: any) => (
        <Badge variant={getGenderVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "dob",
      header: "Age",
      sortable: true,
      filterable: false,
      render: (value: any) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {age} years
            </span>
          </div>
        );
      },
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
      header: "Joined",
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
  const handleCreateUser = (): void => {
    navigate("/user/create");
  };

  const handleEditUser = (record: UserType): void => {
    navigate(`/user/create/${record._id}`);
  };

  const handleDeleteUser = (record: UserType): void => {
    if (
      window.confirm(
        `Are you sure you want to delete "${record.firstName} ${record.lastName}"?`
      )
    ) {
      deleteMutate({ id: record._id });
    }
  };

  // Action items for table
  const actionItems: ActionItem[] = [];

  // Add Edit action if user has permission
  if (canEditUser) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditUser(record);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  // Add Delete action if user has permission
  if (canDeleteUser) {
    actionItems.push({
      label: "Delete",
      onClick: (record: any) => {
        handleDeleteUser(record);
      },
      icon: <Trash className="w-5 h-5 text-destructive" />,
    });
  }

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEditUser) {
      handleEditUser(record);
    }
  };

  // Pagination configuration
  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: usersData?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Delete mutation
  const { mutate: deleteMutate } = useMutation<void, Error, DeleteUserRequest>({
    mutationFn: (variables: DeleteUserRequest) => deleteUser(variables.id),
    onSuccess: () => {
      refetch();
      console.log("User deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Delete user error:", error);
    },
  });

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const maleUsers = users.filter((user) => user.gender === "male").length;
  const femaleUsers = users.filter((user) => user.gender === "female").length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts and their information
          </p>
        </div>
        {canCreateUser && (
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsers}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
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
                Male Users
              </p>
              <p className="text-2xl font-bold text-blue-600">{maleUsers}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Female Users
              </p>
              <p className="text-2xl font-bold text-pink-600">{femaleUsers}</p>
            </div>
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        data={users}
        columns={columns}
        isLoading={loadingDataUsers}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
}
