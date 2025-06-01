/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { searchParamsToString } from "../../lib/utils";
import {
  addAdmin,
  deleteAdmin,
  getAdmins,
  getAdminTypes,
  updateAdmin,
} from "../../lib/apis/queries";
import { useState, type JSX } from "react";
import DynamicTable from "../../components/DynamicTable";
import DynamicModal from "../../components/DynamicModal";
import { Edit, Trash, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import type {
  Admin,
  AdminsResponse,
  AdminTypesResponse,
  AdminFormData,
  CreateAdminRequest,
  UpdateAdminRequest,
  DeleteAdminRequest,
  SearchParams,
  TableColumn,
  Pagination,
} from "../../types/admin";
import type { FieldConfig } from "../../types/modal";
import type { ActionItem } from "../../types/table";
import {
  dataLocalStorage,
  getLocalStorage,
} from "../../helper/public-functions";

export default function Admins(): JSX.Element {
  const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
  const storePrivileges = Object.values(privileges).find(
    (priv: any) => priv.name === "admins"
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
    sortBy: "email",
    sortDirection: "desc",
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const {
    data: admins,
    isLoading: loadingData,
    refetch,
  } = useQuery<AdminsResponse>({
    queryKey: ["admins", searchParamsToString(searchParams)],
    queryFn: () => getAdmins({ params: searchParamsToString(searchParams) }),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: adminsTypes, isLoading: loadingDataTypes } =
    useQuery<AdminTypesResponse>({
      queryKey: [
        "admins-types",
        searchParamsToString({
          limit: 100,
        }),
      ],
      queryFn: () =>
        getAdminTypes({ params: searchParamsToString({ limit: 100 }) }),
      staleTime: Number.POSITIVE_INFINITY,
    });

  // Define columns for the table
  const columns: TableColumn[] = [
    {
      key: "email",
      header: "Email",
      sortable: true,
      filterable: true,
    },
    {
      key: "firstName",
      header: "First Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "lastName",
      header: "Last Name",
      sortable: true,
      filterable: true,
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      filterable: true,
      render: (value: unknown) => {
        const adminType = value as Admin["type"];
        return adminType?.name || "N/A";
      },
    },
  ];

  // Handle modal open for create
  const handleCreateAdmin = (): void => {
    setSelectedAdmin(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Handle modal open for edit
  const handleEditAdmin = (record: any): void => {
    setSelectedAdmin(record);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setIsEditMode(false);
  };

  const actionItems: ActionItem[] = [];
  if (canEdit) {
    actionItems.push({
      label: "Edit",
      onClick: (record: any) => {
        handleEditAdmin(record);
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

  // Handle row click
  const handleRowClick = (record: Record<string, any>): void => {
    handleEditAdmin(record);
  };

  // Prepare pagination object
  const pagination: Pagination = {
    currentPage: searchParams.page as any,
    pageSize: searchParams.limit,
    totalItems: admins?.totalCount || 0,
    onPageChange: (page: number) => {
      setSearchParams((prev) => ({ ...prev, page }));
    },
  };

  // Prepare form data for modal
  const formData: AdminFormData | null =
    isEditMode && selectedAdmin
      ? {
          firstName: selectedAdmin.firstName || "",
          lastName: selectedAdmin.lastName || "",
          email: selectedAdmin.email || "",
          password: "", // Don't pre-fill password for security
          type: selectedAdmin.type?._id || "",
        }
      : null;

  // Define form fields for the modal
  const fields: FieldConfig[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "input",
      placeholder: "Enter first name",
      isRequired: true,
      validation: {
        type: "string",
        min: 2,
        message: "First name must be at least 2 characters",
      },
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "input",
      placeholder: "Enter last name",
      isRequired: true,
      validation: {
        type: "string",
        min: 2,
        message: "Last name must be at least 2 characters",
      },
    },
    {
      name: "email",
      label: "Email",
      type: "input",
      placeholder: "Enter email address",
      isRequired: true,
      validation: {
        type: "email",
        message: "Please enter a valid email address",
      },
    },
    {
      name: "password",
      label: isEditMode
        ? "New Password (leave blank to keep current)"
        : "Password",
      type: "input",
      placeholder: "Enter password",
      isRequired: !isEditMode,
      validation: {
        type: "string",
        min: 6,
        message: "Password must be at least 6 characters",
      },
    },
    {
      name: "type",
      label: "Admin Type",
      type: "dropdown",
      placeholder: "Select admin type",
      isRequired: true,
      options:
        adminsTypes?.data?.map((type) => ({
          value: type._id,
          label: type.name,
        })) || [],
      validation: {
        type: "string",
        message: "Please select an admin type",
      },
    },
  ];

  // Handle form submission
  const handleSubmit = async (
    values: Record<string, unknown>
  ): Promise<void> => {
    try {
      const formValues = values as any;
      const submitData: Omit<CreateAdminRequest, "password"> & {
        password?: string;
      } = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        type: formValues.type,
      };

      // Only include password if it's provided
      if (formValues.password && formValues.password.trim() !== "") {
        submitData.password = formValues.password;
      }

      if (isEditMode && selectedAdmin) {
        const updateData: UpdateAdminRequest = {
          id: selectedAdmin._id,
          ...submitData,
        };
        updateMutate(updateData);
      } else {
        const createData = submitData as CreateAdminRequest;
        createMutate(createData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    }
  };

  const { mutate: createMutate, isPending: isPendingCreate } = useMutation<
    unknown,
    Error,
    CreateAdminRequest
  >({
    mutationFn: (values: CreateAdminRequest) => addAdmin(values),
    onSuccess: () => {
      refetch();
      // toast success message
    },
    onError: (error: Error) => {
      // toast error message
      console.error("Create admin error:", error);
    },
  });

  const { mutate: updateMutate, isPending: isPendingUpdate } = useMutation<
    unknown,
    Error,
    UpdateAdminRequest
  >({
    mutationFn: (values: UpdateAdminRequest) => updateAdmin(values),
    onSuccess: () => {
      refetch();
      // toast success message
    },
    onError: (error: Error) => {
      // toast error message
      console.error("Update admin error:", error);
    },
  });

  const { mutate: deleteMutate } = useMutation<
    unknown,
    Error,
    DeleteAdminRequest
  >({
    mutationFn: (variables: DeleteAdminRequest) => deleteAdmin(variables.id),
    onSuccess: () => {
      refetch();
      // toast success message
    },
    onError: (error: Error) => {
      // toast error message
      console.error("Delete admin error:", error);
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white"></h1>
        {canCreate && (
          <Button
            onClick={handleCreateAdmin}
            className="flex items-center gap-2"
            disabled={isPendingCreate}
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </Button>
        )}
      </div>
      <DynamicTable
        data={admins?.data || []}
        columns={columns}
        isLoading={loadingData || loadingDataTypes}
        hasActions={hasAnyActionPermission}
        actionItems={actionItems}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
      <DynamicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? "Edit Admin" : "Create New Admin"}
        fields={fields}
        data={formData || undefined}
        isEditMode={isEditMode}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? "Update" : "Create"}
        isLoading={isPendingCreate || isPendingUpdate}
      />
    </div>
  );
}
