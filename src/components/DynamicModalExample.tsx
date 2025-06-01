/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import DynamicModal from "./DynamicModal";
import type { FieldConfig } from "../types/modal";

const DynamicModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  // Example field configurations
  const fields: FieldConfig[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "input",
      isRequired: false,
      placeholder: "Enter your first name",
      validation: {
        type: "string",
        min: 2,
        max: 50,
        message: "First name must be between 2 and 50 characters",
      },
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "input",
      isRequired: true,
      placeholder: "Enter your last name",
      validation: {
        type: "string",
        min: 2,
        max: 50,
        message: "Last name must be between 2 and 50 characters",
      },
    },
    {
      name: "email",
      label: "Email Address",
      type: "input",
      isRequired: true,
      placeholder: "Enter your email address",
      validation: {
        type: "email",
        message: "Please enter a valid email address",
      },
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "phone",
      isRequired: true,
      validation: {
        type: "phone",
        message: "Please enter a valid phone number",
      },
    },
    {
      name: "profileImage",
      label: "Profile Image",
      type: "upload",
      isRequired: false,
    },
    {
      name: "galleryImages",
      label: "Gallery Images",
      type: "upload",
      isRequired: false,
      multiple: true,
      maxFiles: 3,
    },
    {
      name: "role",
      label: "Role",
      type: "dropdown",
      isRequired: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Editor", value: "editor" },
      ],
      validation: {
        type: "string",
        message: "Please select a role",
      },
    },
    {
      name: "isActive",
      label: "Active Status",
      type: "switch",
      initialValue: true,
    },
    {
      name: "receiveNotifications",
      label: "Receive email notifications",
      type: "checkbox",
      initialValue: false,
    },
  ];

  // Example data for edit mode
  const exampleUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "12025550123",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg", // Sample image URL for testing
    galleryImages: [
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/2.jpg",
      "https://randomuser.me/api/portraits/men/3.jpg",
    ], // Sample image URLs for multiple upload testing
    role: "admin",
    isActive: true,
    receiveNotifications: true,
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setIsEditMode(true);
    setFormData(exampleUserData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (values: Record<string, any>) => {
    // Create a copy of values to handle File objects for display
    const displayValues = { ...values };

    // Handle File objects for display in the alert
    Object.keys(values).forEach((key) => {
      // Handle single file
      if (values[key] instanceof File) {
        displayValues[key] = `File: ${values[key].name} (${values[key].type})`;
      }
      // Handle array of files for multiple file uploads
      else if (
        Array.isArray(values[key]) &&
        values[key].length > 0 &&
        values[key][0] instanceof File
      ) {
        displayValues[key] = values[key].map(
          (file: File) => `File: ${file.name} (${file.type})`
        );
      }

      // Remove preview data from display values
      if (key.endsWith("_preview") || key.endsWith("_previews")) {
        delete displayValues[key];
      }
    });

    // In a real application, you would send this data to an API
    // For file uploads, you would typically use FormData

    // Example of how you might handle file uploads in a real application:
    // const formData = new FormData();
    // Object.keys(values).forEach(key => {
    //   if (values[key] instanceof File) {
    //     formData.append(key, values[key]);
    //   } else if (Array.isArray(values[key]) && values[key].length > 0 && values[key][0] instanceof File) {
    //     // For multiple files, append each file with the same key
    //     values[key].forEach((file: File, index: number) => {
    //       formData.append(`${key}[${index}]`, file);
    //     });
    //   } else if (typeof values[key] === 'string' || typeof values[key] === 'number' || typeof values[key] === 'boolean') {
    //     formData.append(key, String(values[key]));
    //   }
    // });
    // Then send formData to your API

    alert(JSON.stringify(displayValues, null, 2));
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dynamic Modal Example</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New User
        </button>

        <button
          onClick={handleOpenEditModal}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Edit User
        </button>
      </div>
      <DynamicModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? "Edit User" : "Create New User"}
        fields={fields}
        data={formData || undefined}
        isEditMode={isEditMode}
        onSubmit={handleSubmit}
        submitButtonText={isEditMode ? "Update" : "Create"}
      />
    </div>
  );
};

export default DynamicModalExample;
