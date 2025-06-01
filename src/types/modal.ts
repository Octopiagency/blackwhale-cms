/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export type FieldType =
  | "input"
  | "dropdown"
  | "switch"
  | "checkbox"
  | "phone"
  | "upload";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  isRequired?: boolean;
  placeholder?: string;
  options?: FieldOption[]; // For dropdown, checkbox groups
  initialValue?: any;
  multiple?: boolean; // For upload fields - allows multiple file uploads
  maxFiles?: number; // For upload fields - maximum number of files allowed
  validation?: {
    type?: "string" | "number" | "boolean" | "date" | "email" | "url" | "phone";
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface DynamicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  data?: Record<string, any>; // For edit mode
  isEditMode?: boolean;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  submitButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}
