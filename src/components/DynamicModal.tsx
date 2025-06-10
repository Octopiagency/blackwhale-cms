"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  X,
  Edit,
  Trash2,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { DynamicModalProps, FieldConfig } from "../types/modal";

const DynamicModal = ({
  isOpen,
  onClose,
  title,
  fields,
  initialValues: propInitialValues,
  data,
  isEditMode = false,
  onSubmit,
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
  isLoading = false,
}: DynamicModalProps) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(isOpen);

    // Add animation class when opening
    if (isOpen && modalRef.current) {
      modalRef.current.classList.add("modal-enter");
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.classList.remove("modal-enter");
        }
      }, 300);
    }
  }, [isOpen]);

  // Close modal with animation
  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.classList.add("modal-exit");
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    } else {
      setIsVisible(false);
      onClose();
    }
  };

  // Generate initial values from fields or use provided initialValues
  const generateInitialValues = () => {
    const values: Record<string, any> = {};

    // Start with default initial values from field configs
    fields.forEach((field) => {
      values[field.name] =
        field.initialValue !== undefined ? field.initialValue : "";
    });

    // Override with provided initialValues
    if (propInitialValues) {
      Object.keys(propInitialValues).forEach((key) => {
        values[key] = propInitialValues[key];
      });
    }

    // If in edit mode, use data values
    if (isEditMode && data) {
      Object.keys(data).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          values[key] = data[key];
        }
      });
    }

    return values;
  };

  // Generate validation schema from fields
  const generateValidationSchema = () => {
    const schemaFields: Record<string, any> = {};

    fields.forEach((field) => {
      let validator;

      // Start with the appropriate Yup type
      switch (field.validation?.type || "string") {
        case "number":
          validator = Yup.number();
          break;
        case "boolean":
          validator = Yup.boolean();
          break;
        case "date":
          validator = Yup.date();
          break;
        case "email":
          validator = Yup.string().email(
            field.validation?.message || "Invalid email address"
          );
          break;
        case "url":
          validator = Yup.string().url(
            field.validation?.message || "Invalid URL"
          );
          break;
        case "phone":
          validator = Yup.string().matches(
            /^\+?[1-9]\d{1,14}$/,
            field.validation?.message || "Invalid phone number"
          );
          break;
        default:
          // For upload fields, we need to handle both File objects and string URLs
          if (field.type === "upload") {
            validator = Yup.mixed();
          } else {
            validator = Yup.string();
          }
      }

      // Add additional validation rules
      if (field.isRequired) {
        validator = validator.required(
          field.validation?.message || `${field.label} is required`
        );
      }

      if (
        field.validation?.min !== undefined &&
        (field.validation.type === "string" || !field.validation.type)
      ) {
        validator = (validator as Yup.StringSchema).min(
          field.validation.min,
          field.validation.message ||
            `Minimum ${field.validation.min} characters required`
        );
      }

      if (
        field.validation?.max !== undefined &&
        (field.validation.type === "string" || !field.validation.type)
      ) {
        validator = (validator as Yup.StringSchema).max(
          field.validation.max,
          field.validation.message ||
            `Maximum ${field.validation.max} characters allowed`
        );
      }

      if (
        field.validation?.min !== undefined &&
        field.validation.type === "number"
      ) {
        validator = (validator as Yup.StringSchema).min(
          field.validation.min,
          field.validation.message ||
            `Value must be at least ${field.validation.min}`
        );
      }

      if (
        field.validation?.max !== undefined &&
        field.validation.type === "number"
      ) {
        validator = (validator as Yup.StringSchema).max(
          field.validation.max,
          field.validation.message ||
            `Value must be at most ${field.validation.max}`
        );
      }

      if (field.validation?.pattern) {
        validator = (validator as Yup.StringSchema).matches(
          field.validation.pattern,
          field.validation.message || "Invalid format"
        );
      }

      schemaFields[field.name] = validator;
    });

    return Yup.object().shape(schemaFields);
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    field,
    options,
    value,
    onChange,
    hasError,
  }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

    // Find the selected option label
    const selectedOption = options?.find(
      (opt: any) => opt.value.toString() === value?.toString()
    );

    // Filter options based on search term
    const filteredOptions = options?.filter((option: any) =>
      option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );

    // Update dropdown position when it opens
    useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative">
        <div
          ref={triggerRef}
          className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer ${
            isOpen
              ? "ring-2 ring-blue-500 border-blue-500"
              : hasError
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } dark:bg-gray-700 dark:text-white`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="truncate">
            {selectedOption ? selectedOption.label : `Select ${field.label}`}
          </div>
          <div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="py-1">
                {filteredOptions?.length > 0 ? (
                  filteredOptions.map((option: any) => (
                    <div
                      key={option.value.toString()}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                        option.value.toString() === value?.toString()
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        onChange(option.value.toString());
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      {option.label}
                      {option.value.toString() === value?.toString() && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    No options found
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  };

  // Enhanced Phone Input Component
  const EnhancedPhoneInput = ({ value, onChange, hasError }: any) => {
    const phoneInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Add a class to the document body to help with phone input dropdown positioning
      document.body.classList.add("has-phone-dropdown");

      return () => {
        document.body.classList.remove("has-phone-dropdown");
      };
    }, []);

    return (
      <div className="custom-phone-input-container" ref={phoneInputRef}>
        <PhoneInput
          country={"us"}
          value={value}
          onChange={onChange}
          inputClass={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            hasError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          } dark:bg-gray-700 dark:text-white`}
          containerClass="phone-input-container"
          buttonClass={`phone-input-button ${
            hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
          dropdownClass="phone-input-dropdown bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          searchClass="phone-input-search"
          enableSearch={true}
          disableSearchIcon={false}
          searchPlaceholder="Search country..."
        />
      </div>
    );
  };

  // Render different field types
  const renderField = (
    field: FieldConfig,
    errors: any,
    touched: any,
    values: any,
    setFieldValue: any
  ) => {
    const hasError = errors[field.name] && touched[field.name];

    switch (field.type) {
      case "input":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Field
              name={field.name}
              placeholder={field.placeholder || ""}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
              } dark:bg-gray-700 dark:text-white transition-all duration-200`}
            />
            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
        );

      case "dropdown":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <CustomDropdown
              field={field}
              options={field.options}
              value={values[field.name]}
              onChange={(value: string) => setFieldValue(field.name, value)}
              hasError={hasError}
            />
            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
        );

      case "switch":
        return (
          <div className="mb-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <Field type="checkbox" name={field.name} className="sr-only" />
                <div
                  className={`block w-10 h-6 rounded-full transition-colors duration-300 ${
                    values[field.name]
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                    values[field.name] ? "transform translate-x-4" : ""
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </div>
            </label>
            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500 ml-2"
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <Field
                type="checkbox"
                name={field.name}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 transition-colors duration-200"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            </label>
            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
        );

      case "phone":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <EnhancedPhoneInput
              value={values[field.name]}
              onChange={(phone: string) => setFieldValue(field.name, phone)}
              hasError={hasError}
            />
            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
        );

      case "upload": {
        // Check if multiple files are allowed
        const isMultiple = field.multiple === true;
        // Get the maximum number of files allowed (default to 5 if not specified)
        const maxFiles = field.maxFiles || 5;

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (isMultiple) {
              // Handle multiple files
              const currentFiles = values[field.name] || [];
              const currentFilesArray = Array.isArray(currentFiles)
                ? currentFiles
                : [currentFiles].filter(Boolean);

              // Convert FileList to Array
              const newFiles = Array.from(e.dataTransfer.files);

              // Check if adding these files would exceed the maximum
              if (currentFilesArray.length + newFiles.length > maxFiles) {
                alert(`You can only upload a maximum of ${maxFiles} files.`);
                // Only add files up to the maximum
                const availableSlots = maxFiles - currentFilesArray.length;
                if (availableSlots > 0) {
                  handleMultipleFileChange(newFiles.slice(0, availableSlots));
                }
              } else {
                handleMultipleFileChange(newFiles);
              }
            } else {
              // Handle single file (original behavior)
              const file = e.dataTransfer.files[0];
              handleSingleFileChange(file);
            }
          }
        };

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
        };

        const handleSingleFileChange = (file: File) => {
          setFieldValue(field.name, file);

          // Create a URL for the file preview
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                setFieldValue(`${field.name}_preview`, e.target.result);
              }
            };
            reader.readAsDataURL(file);
          } else {
            setFieldValue(`${field.name}_preview`, null);
          }
        };

        const handleMultipleFileChange = (files: File[]) => {
          // Get current files (if any)
          const currentFiles = values[field.name] || [];
          const currentFilesArray = Array.isArray(currentFiles)
            ? currentFiles
            : [currentFiles].filter(Boolean);

          // Combine with new files
          const updatedFiles = [...currentFilesArray, ...files];

          // Limit to maxFiles
          const limitedFiles = updatedFiles.slice(0, maxFiles);

          // Update the field value with the array of files
          setFieldValue(field.name, limitedFiles);

          // Process each new file for preview
          files.forEach((file) => {
            if (file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  const newPreviews = [
                    ...(values[`${field.name}_previews`] || []),
                    {
                      file: file,
                      preview: e.target.result,
                    },
                  ];
                  setFieldValue(`${field.name}_previews`, newPreviews);
                }
              };
              reader.readAsDataURL(file);
            }
          });
        };

        const handleFileInputChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          if (e.target.files && e.target.files.length > 0) {
            if (isMultiple) {
              // Handle multiple files
              const currentFiles = values[field.name] || [];
              const currentFilesArray = Array.isArray(currentFiles)
                ? currentFiles
                : [currentFiles].filter(Boolean);

              // Convert FileList to Array
              const newFiles = Array.from(e.target.files);

              // Check if adding these files would exceed the maximum
              if (currentFilesArray.length + newFiles.length > maxFiles) {
                alert(`You can only upload a maximum of ${maxFiles} files.`);
                // Only add files up to the maximum
                const availableSlots = maxFiles - currentFilesArray.length;
                if (availableSlots > 0) {
                  handleMultipleFileChange(newFiles.slice(0, availableSlots));
                }
              } else {
                handleMultipleFileChange(newFiles);
              }
            } else {
              // Handle single file (original behavior)
              const file = e.target.files[0];
              handleSingleFileChange(file);
            }
          }
        };

        const handleRemoveFile = (index?: number) => {
          if (isMultiple && typeof index === "number") {
            // Remove a specific file from the array
            const currentFiles = values[field.name] || [];
            const currentFilesArray = Array.isArray(currentFiles)
              ? currentFiles
              : [currentFiles].filter(Boolean);
            const currentPreviews = values[`${field.name}_previews`] || [];
            const currentPreviewsArray = Array.isArray(currentPreviews)
              ? currentPreviews
              : [currentPreviews].filter(Boolean);

            // Remove the file and its preview
            const updatedFiles = [...currentFilesArray];
            updatedFiles.splice(index, 1);

            const updatedPreviews = [...currentPreviewsArray];
            updatedPreviews.splice(index, 1);

            setFieldValue(
              field.name,
              updatedFiles.length > 0 ? updatedFiles : null
            );
            setFieldValue(
              `${field.name}_previews`,
              updatedPreviews.length > 0 ? updatedPreviews : null
            );
          } else {
            // Remove the single file (original behavior)
            setFieldValue(field.name, null);
            setFieldValue(`${field.name}_preview`, null);
          }
        };

        const handleEditFile = (index?: number) => {
          // Trigger file input click
          const fileInput = document.getElementById(`${field.name}-file-input`);
          if (fileInput) {
            // Store the index being edited for multiple files
            if (isMultiple && typeof index === "number") {
              (fileInput as any)._editIndex = index;
            }
            fileInput.click();
          }
        };

        // Check if we have files or image paths from existing data
        const hasExistingFile = isEditMode && data && data[field.name];

        // For single file upload
        const filePreview = values[`${field.name}_preview`];

        // For multiple file upload
        const filePreviews = values[`${field.name}_previews`] || [];

        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              {isMultiple && (
                <span className="text-xs text-gray-500 ml-2">
                  (Max: {maxFiles} files)
                </span>
              )}
            </label>

            {isMultiple ? (
              /* Multiple files preview area */
              <div className="mt-2 mb-2">
                {/* Display multiple file previews */}
                {filePreviews && filePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filePreviews.map((preview: any, index: number) => (
                      <div
                        key={index}
                        className="relative group transition-all duration-300 hover:shadow-md"
                      >
                        <img
                          src={preview.preview || "/placeholder.svg"}
                          alt={`File preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300 dark:border-gray-600 transition-all duration-300"
                        />
                        {/* Edit and delete buttons */}
                        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => handleEditFile(index)}
                            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Edit size={12} className="text-blue-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more images button (if under max limit) */}
                    {filePreviews.length < maxFiles && (
                      <div
                        className="w-full h-24 flex items-center justify-center border-2 border-dashed rounded border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          const fileInput = document.getElementById(
                            `${field.name}-file-input`
                          );
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Add more
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : hasExistingFile && Array.isArray(data[field.name]) ? (
                  /* Display existing multiple files from data */
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data[field.name].map((url: string, index: number) => (
                      <div
                        key={index}
                        className="relative group transition-all duration-300 hover:shadow-md"
                      >
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Existing file ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300 dark:border-gray-600 transition-all duration-300"
                        />
                        {/* Edit and delete buttons */}
                        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => handleEditFile(index)}
                            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Edit size={12} className="text-blue-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more images button (if under max limit) */}
                    {data[field.name].length < maxFiles && (
                      <div
                        className="w-full h-24 flex items-center justify-center border-2 border-dashed rounded border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          const fileInput = document.getElementById(
                            `${field.name}-file-input`
                          );
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Add more
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upload area for multiple files when no files are selected yet */
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        `${field.name}-file-input`
                      );
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor={`${field.name}-file-input`}
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 focus-within:outline-none"
                        >
                          <span>Upload images</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB (Max {maxFiles} files)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Single file preview area (original behavior) */
              <>
                {filePreview || hasExistingFile ? (
                  <div className="relative mt-2 mb-2 group transition-all duration-300 hover:shadow-md">
                    {filePreview ? (
                      <img
                        src={filePreview || "/placeholder.svg"}
                        alt="File preview"
                        className="max-w-full h-auto max-h-48 rounded border border-gray-300 dark:border-gray-600 transition-all duration-300"
                      />
                    ) : hasExistingFile ? (
                      <img
                        src={
                          data[field.name] &&
                          typeof data[field.name] === "object" &&
                          data[field.name].path
                            ? `${
                                import.meta.env.VITE_SERVER_API_BASEURL_IMAGE
                              }/${data[field.name].path}`
                            : typeof data[field.name] === "string"
                            ? `${
                                import.meta.env.VITE_SERVER_API_BASEURL_IMAGE
                              }/${data[field.name]}`
                            : "/placeholder.svg"
                        }
                        alt="Existing file"
                        className="max-w-full h-auto max-h-48 rounded border border-gray-300 dark:border-gray-600 transition-all duration-300"
                      />
                    ) : null}

                    {/* Edit and delete buttons */}
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => handleEditFile()}
                        className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Edit size={16} className="text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile()}
                        className="p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-colors duration-200"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        `${field.name}-file-input`
                      );
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor={`${field.name}-file-input`}
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <input
              id={`${field.name}-file-input`}
              name={field.name}
              type="file"
              accept="image/*"
              multiple={isMultiple}
              className="sr-only"
              onChange={handleFileInputChange}
            />

            <ErrorMessage
              name={field.name}
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Blurred backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/50 transition-all"
        onClick={handleClose}
      ></div>

      {/* Modal container */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden transition-all duration-300 transform"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content and footer wrapped in single Formik */}
        <Formik
          initialValues={generateInitialValues()}
          validationSchema={generateValidationSchema()}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values);
            } catch (error) {
              console.error("Form submission error:", error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            errors,
            touched,
            values,
            setFieldValue,
            isSubmitting,
            handleSubmit,
          }) => (
            <>
              {/* Scrollable content */}
              <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
                <div className="p-4">
                  <Form id="modal-form">
                    {fields.map((field) => (
                      <div key={field.name}>
                        {renderField(
                          field,
                          errors,
                          touched,
                          values,
                          setFieldValue
                        )}
                      </div>
                    ))}
                  </Form>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 z-10 flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {cancelButtonText}
                </button>
                <button
                  type="submit"
                  form="modal-form"
                  disabled={isSubmitting || isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting || isLoading
                    ? "Submitting..."
                    : submitButtonText}
                </button>
              </div>
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DynamicModal;
