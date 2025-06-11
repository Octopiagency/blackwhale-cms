"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { UserFormValues } from "../../types/user";
import { useUserForm } from "../../hooks/use-user-form";
import { Card, CardContent } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import UserForm from "./user-form";

export default function CreateUserPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    userData,
    isLoadingUser,
    userError,
    createMutation,
    updateMutation,
    isEditMode,
  } = useUserForm(id);

  const handleSubmit = (values: UserFormValues) => {
    const formData = new FormData();

    // Append basic fields
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    formData.append("gender", values.gender);
    formData.append("dob", values.dob);
    formData.append("isActive", values.isActive.toString());

    // Phone
    formData.append("phone[code]", values.phone.code);
    formData.append("phone[number]", values.phone.number);

    // Append image if present
    if (values.image) {
      formData.append("image", values.image);
    }

    if (isEditMode && id) {
      formData.append("user_id", id);
      updateMutation.mutate(formData as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading user data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load user data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8 justify-between w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Edit User" : "Create New User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode
              ? "Update the user information below"
              : "Fill in the details to create a new user"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/user/list")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Button>
      </div>

      {/* Form */}
      <UserForm
        initialData={userData?.user}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isEditMode={isEditMode}
      />
    </div>
  );
}
