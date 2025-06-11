"use client";

import type React from "react";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import type { User, UserFormValues } from "../../types/user";
import { UserIcon } from "lucide-react";

interface UserFormProps {
  initialData?: User;
  onSubmit: (values: UserFormValues) => void;
  isLoading: boolean;
  isEditMode: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.object({
    code: Yup.string().required("Phone code is required"),
    number: Yup.string().required("Phone number is required"),
  }),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.string().required("Date of birth is required"),
});

export default function UserForm({
  initialData,
  onSubmit,
  isLoading,
  isEditMode,
}: UserFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image?.path
      ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
          initialData.image.path
        }`
      : null
  );

  const formik = useFormik<UserFormValues>({
    initialValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: {
        code: initialData?.phone?.code?.toString() || "",
        number: initialData?.phone?.number?.toString() || "",
      },
      gender: initialData?.gender || "",
      dob: initialData?.dob
        ? new Date(initialData.dob).toISOString().split("T")[0]
        : "",
      image: null,
      isActive: initialData?.isActive ?? true,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(
      initialData?.image?.path
        ? `${import.meta.env.VITE_SERVER_API_BASEURL_IMAGE}/${
            initialData.image.path
          }`
        : null
    );
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter first name"
                className={
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-sm text-red-500">
                  {formik.errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter last name"
                className={
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-sm text-red-500">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter email address"
              className={
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formik.values.gender}
                onValueChange={(value) => formik.setFieldValue("gender", value)}
              >
                <SelectTrigger
                  className={
                    formik.touched.gender && formik.errors.gender
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-sm text-red-500">{formik.errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={
                  formik.touched.dob && formik.errors.dob
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.dob && formik.errors.dob && (
                <p className="text-sm text-red-500">{formik.errors.dob}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formik.values.isActive}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("isActive", checked)
                }
              />
              <Label htmlFor="isActive" className="text-sm">
                {formik.values.isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone.code">Phone Code *</Label>
              <Input
                id="phone.code"
                name="phone.code"
                value={formik.values.phone.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., 961"
                className={
                  formik.touched.phone?.code && formik.errors.phone?.code
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.phone?.code && formik.errors.phone?.code && (
                <p className="text-sm text-red-500">
                  {formik.errors.phone.code}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone.number">Phone Number *</Label>
              <Input
                id="phone.number"
                name="phone.number"
                value={formik.values.phone.number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter phone number"
                className={
                  formik.touched.phone?.number && formik.errors.phone?.number
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.phone?.number && formik.errors.phone?.number && (
                <p className="text-sm text-red-500">
                  {formik.errors.phone.number}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Image */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Image</span>
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                  <span className="ml-2">Remove</span>
                </Button>
              )}
            </div>
            {imagePreview && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-full border shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formik.isValid}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditMode ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
