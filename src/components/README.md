# Dynamic Modal Component

A flexible and reusable modal component with Formik integration, Yup validation, and support for various field types.

## Features

- Configurable form fields through props
- Support for multiple field types:
  - Text inputs
  - Dropdowns
  - Switches
  - Checkboxes
  - Phone inputs with country code selection
- Form validation with Yup
- Create and edit modes
- Dark mode support
- Animations for opening and closing

## Required Dependencies

Before using this component, make sure to install the required dependencies:

```bash
npm install formik yup react-phone-input-2
```

## Usage

### Basic Example

```tsx
import { useState } from "react";
import DynamicModal from "./components/DynamicModal";
import { FieldConfig } from "./types/modal";

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fields: FieldConfig[] = [
    {
      name: "username",
      label: "Username",
      type: "input",
      isRequired: true,
      placeholder: "Enter username",
      validation: {
        type: "string",
        min: 3,
        max: 20,
      },
    },
    {
      name: "role",
      label: "Role",
      type: "dropdown",
      isRequired: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  ];

  const handleSubmit = (values) => {
    console.log(values);
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      
      <DynamicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create User"
        fields={fields}
        onSubmit={handleSubmit}
      />
    </>
  );
};
```

### Edit Mode Example

```tsx
<DynamicModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  title="Edit User"
  fields={fields}
  data={userData}
  isEditMode={true}
  onSubmit={handleSubmit}
  submitButtonText="Update"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Controls whether the modal is visible |
| onClose | () => void | Yes | Function to call when the modal is closed |
| title | string | Yes | Title displayed at the top of the modal |
| fields | FieldConfig[] | Yes | Array of field configurations |
| initialValues | Record<string, any> | No | Initial values for the form fields |
| data | Record<string, any> | No | Data for edit mode |
| isEditMode | boolean | No | Whether the modal is in edit mode |
| onSubmit | (values: Record<string, any>) => void \| Promise<void> | Yes | Function to call when the form is submitted |
| submitButtonText | string | No | Text for the submit button (default: "Submit") |
| cancelButtonText | string | No | Text for the cancel button (default: "Cancel") |

## Field Configuration

Each field in the `fields` array should have the following structure:

```typescript
interface FieldConfig {
  name: string;           // Field name (used as the key in form values)
  label: string;          // Display label
  type: FieldType;        // 'input', 'dropdown', 'switch', 'checkbox', or 'phone'
  isRequired?: boolean;   // Whether the field is required
  placeholder?: string;   // Placeholder text (for input fields)
  options?: FieldOption[]; // Options for dropdown fields
  initialValue?: any;     // Default value
  validation?: {          // Validation rules
    type?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'phone';
    min?: number;         // Minimum length (string) or value (number)
    max?: number;         // Maximum length (string) or value (number)
    pattern?: RegExp;     // Regular expression pattern
    message?: string;     // Custom error message
  };
}

interface FieldOption {
  label: string;
  value: string | number | boolean;
}
```

## Example Component

For a complete example of how to use this component, see the `DynamicModalExample.tsx` file.