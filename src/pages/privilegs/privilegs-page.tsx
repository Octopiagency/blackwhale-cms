/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type JSX } from "react";
import type {
  AdminTypesResponse,
  DeleteAdminRequest,
  Pagination,
  SearchParams,
  TableColumn,
} from "../../types/admin";
import type { ActionItem } from "../../types/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import { deleteAdminType, getAdminTypes } from "../../lib/apis/queries";
import { Button } from "../../components/ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import DynamicTable from "../../components/DynamicTable";
import { useNavigate } from "react-router-dom";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export default function AdminTypesPage(): JSX.Element {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "adminTypes"
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
    sortBy: "name",
    sortDirection: "desc",
  });

  const {
    data: adminsTypes,
    isLoading: loadingDataTypes,
    refetch,
  } = useQuery<AdminTypesResponse>({
    queryKey: ["admins-types", searchParamsToString(searchParams)],
    queryFn: () =>
      getAdminTypes({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Define columns for the admin types table
  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Admin Type Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "privileges",
      header: "Privileges Count",
      sortable: false,
      filterable: false,
      render: (value: unknown) => {
        const privileges = value as any[];
        return `${privileges?.length || 0} privileges`;
      },
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      filterable: true,
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      filterable: false,
      render: (value: unknown) => {
        const date = value as string;
        return new Date(date).toLocaleDateString();
      },
    },
  ];

  const handleRowClick = (record: any): void => {
    // Only navigate to edit page if user has edit permission
    if (canEdit) {
      navigate(`/admin-types/create/${record._id}`);
    }
  };

  const { mutate: deleteMutate } = useMutation<
    unknown,
    Error,
    DeleteAdminRequest
  >({
    mutationFn: (variables: DeleteAdminRequest) =>
      deleteAdminType(variables.id),
    onSuccess: () => {
      refetch();
      // toast success message
    },
    onError: (error: Error) => {
      // toast error message
      console.error("Delete admin type error:", error);
    },
  });

  const actionItems: ActionItem[] = [];
  if (canEdit) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        navigate(`/admin-types/create/${record._id}`);
      },
      icon: <Edit className="w-5 h-5 text-primary" />,
    });
  }

  // Add Delete action if user has permission
  if (canDelete) {
    actionItems.push({
      label: "Delete",
      onClick: (record: any) => {
        deleteMutate({ id: record._id });
      },
      icon: <Trash className="w-5 h-5 text-destructive" />,
    });
  }

  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: adminsTypes?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white"></h1>
        {canCreate && (
          <Button
            onClick={() => {
              navigate("/admin-types/create");
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Admin Type
          </Button>
        )}
      </div>

      <DynamicTable
        data={adminsTypes?.data || []}
        columns={columns}
        isLoading={loadingDataTypes}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
}
