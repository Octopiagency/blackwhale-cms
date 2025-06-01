/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addPrivileges,
  editPrivileges,
  getAdminTypes,
  getFunctionsAll,
} from "../../lib/apis/queries";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";

const AddPrivileges: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const naviagte = useNavigate();
  const [errorType, setErrorType] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [privileges, setPrivileges] = useState<any[]>([]);
  const [duplicateNameError, setDuplicateNameError] = useState(false);

  const editMode = !!id;
  const queryClient = useQueryClient();

  // Fetch functions data
  const {
    data: functionsData,
    isLoading: isLoadingFunctions,
    error: functionsError,
  } = useQuery({
    queryKey: ["functions"],
    queryFn: getFunctionsAll,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Fetch admin types data
  const {
    data: adminsTypesDataAll,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useQuery({
    queryKey: ["adminsTypes"],
    queryFn: () => getAdminTypes({ params: {} }),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const adminsTypesData = adminsTypesDataAll?.data || [];

  // Add privileges mutation
  const addMutation = useMutation({
    mutationFn: addPrivileges,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminsTypes"] });
      resetForm();
      naviagte(`/admin-types/list`);
    },
    onError: () => {},
  });

  // Edit privileges mutation
  const editMutation = useMutation({
    mutationFn: ({ values, id }: { values: any; id: string }) =>
      editPrivileges(values, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminsTypes"] });
      naviagte(`/admin-types/list`);
    },
    onError: () => {},
  });

  const isLoading = isLoadingFunctions || isLoadingTypes;
  const isSubmitting = addMutation.isPending || editMutation.isPending;

  // Get names array for duplicate checking
  const namesArray =
    adminsTypesData?.map((admin: any) => admin.name.toLowerCase()) || [];

  // Find admin data for edit mode
  const adminData = Array.isArray(adminsTypesData)
    ? adminsTypesData.find((type: any) => type._id === id)
    : null;

  const handleChange = (itemId: string, accessType: string) => {
    const updatedPrivileges = privileges.map((item) => {
      if (item._id === itemId) {
        return {
          ...item,
          [accessType]: !item[accessType],
        };
      }
      return item;
    });
    setPrivileges(updatedPrivileges);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTypeName(inputValue);
    setDuplicateNameError(namesArray.includes(inputValue.toLowerCase()));
    if (inputValue) {
      setErrorType(false);
    }
  };

  const selectAll = () => {
    const updatedPrivileges = privileges.map((item) => ({
      ...item,
      access_read: true,
      access_write: true,
      access_edit: true,
      access_delete: true,
    }));
    setPrivileges(updatedPrivileges);
  };

  const unSelectAll = () => {
    const updatedPrivileges = privileges.map((item) => ({
      ...item,
      access_read: false,
      access_write: false,
      access_edit: false,
      access_delete: false,
    }));
    setPrivileges(updatedPrivileges);
  };

  const selectRow = (itemId: string) => {
    const updatedPrivileges = privileges.map((item) => {
      if (item._id === itemId) {
        return {
          ...item,
          access_read: true,
          access_write: true,
          access_edit: true,
          access_delete: true,
        };
      }
      return item;
    });
    setPrivileges(updatedPrivileges);
  };

  const unSelectRow = (itemId: string) => {
    const updatedPrivileges = privileges.map((item) => {
      if (item._id === itemId) {
        return {
          ...item,
          access_read: false,
          access_write: false,
          access_edit: false,
          access_delete: false,
        };
      }
      return item;
    });
    setPrivileges(updatedPrivileges);
  };

  const resetForm = () => {
    setTypeName("");
    const resetPrivileges = privileges.map((privilege) => ({
      ...privilege,
      access_read: false,
      access_write: false,
      access_edit: false,
      access_delete: false,
    }));
    setPrivileges(resetPrivileges);
  };

  const onSubmit = async () => {
    if (!typeName) {
      setErrorType(true);
      return;
    }
    setErrorType(false);

    const formattedPrivileges = privileges.reduce((acc, privilege) => {
      acc[privilege._id] = {
        read: privilege.access_read || false,
        write: privilege.access_write || false,
        update: privilege.access_edit || false,
        delete: privilege.access_delete || false,
      };
      return acc;
    }, {} as Record<string, any>);

    const result = {
      name: typeName,
      privileges: formattedPrivileges,
    };

    if (editMode) {
      editMutation.mutate({ values: result, id: id! });
    } else {
      addMutation.mutate(result);
    }
  };

  // Initialize privileges from functions data
  useEffect(() => {
    if (functionsData && !editMode) {
      const initialPrivileges = functionsData.map((func: any) => ({
        ...func,
        access_read: false,
        access_write: false,
        access_edit: false,
        access_delete: false,
      }));
      setPrivileges(initialPrivileges);
    }
  }, [functionsData, editMode]);

  // Load data for edit mode
  useEffect(() => {
    if (editMode && adminData && functionsData) {
      setTypeName(adminData.name);
      const adminPrivileges = adminData.privileges.map((privilege: any) => {
        const correspondingFunction = functionsData.find(
          (func: any) => func._id === privilege.function._id
        );
        return {
          _id: privilege.function._id,
          name: correspondingFunction ? correspondingFunction.name : "",
          access_read: privilege.read,
          access_write: privilege.write,
          access_edit: privilege.update,
          access_delete: privilege.delete,
        };
      });
      setPrivileges(adminPrivileges);
    }
  }, [adminData, editMode, functionsData]);

  // Handle errors
  if (functionsError || typesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {functionsError?.message ||
                typesError?.message ||
                "Failed to load required data"}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="text-primary w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-900 dark:text-gray-100"></CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  naviagte(`/admin-types/list`);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card>
          <CardContent className="space-y-6">
            {/* Type Name Input */}
            <div className="space-y-2 mt-4">
              <Input
                id="typeName"
                label="Type name *"
                placeholder="Enter type name"
                value={typeName}
                onChange={handleInput}
                error={
                  errorType
                    ? "Type name is required"
                    : duplicateNameError
                    ? "This name is already used"
                    : undefined
                }
              />
            </div>

            {/* Bulk Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                onClick={selectAll}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select All
              </Button>
              <Button
                onClick={unSelectAll}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                Unselect All
              </Button>
            </div>

            {/* Privileges Table */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-1">
                {/* Table Header */}
                <div className="grid grid-cols-8 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium text-gray-900 dark:text-gray-100">
                  <div className="col-span-2">Function</div>
                  <div className="text-center">Read</div>
                  <div className="text-center">Write</div>
                  <div className="text-center">Edit</div>
                  <div className="text-center">Delete</div>
                  <div className="text-center">Select Row</div>
                  <div className="text-center">Unselect Row</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {privileges.map((privilege) => (
                    <div
                      key={privilege._id}
                      className="grid grid-cols-8 gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="col-span-2 flex items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {privilege.name}
                        </span>
                      </div>

                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={privilege.access_read || false}
                          onCheckedChange={() =>
                            handleChange(privilege._id, "access_read")
                          }
                        />
                      </div>

                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={privilege.access_write || false}
                          onCheckedChange={() =>
                            handleChange(privilege._id, "access_write")
                          }
                        />
                      </div>

                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={privilege.access_edit || false}
                          onCheckedChange={() =>
                            handleChange(privilege._id, "access_edit")
                          }
                        />
                      </div>

                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={privilege.access_delete || false}
                          onCheckedChange={() =>
                            handleChange(privilege._id, "access_delete")
                          }
                        />
                      </div>

                      <div className="flex justify-center items-center">
                        <Button
                          onClick={() => selectRow(privilege._id)}
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center items-center">
                        <Button
                          onClick={() => unSelectRow(privilege._id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || duplicateNameError || !typeName}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPrivileges;
