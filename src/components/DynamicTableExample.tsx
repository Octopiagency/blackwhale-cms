/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import DynamicTable from "./DynamicTable";
import type { ColumnConfig, ActionItem } from "../types/table";

const DynamicTableExample = () => {
  const [data, setData] = useState<Record<string, any>[]>([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      age: 32,
      isActive: true,
      tags: ["developer", "frontend"],
      status: true,
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      age: 28,
      isActive: false,
      tags: ["designer", "ui/ux"],
      status: false,
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      age: 35,
      isActive: true,
      tags: ["developer", "backend"],
      status: true,
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Williams",
      email: "emily.williams@example.com",
      age: 30,
      isActive: true,
      tags: ["manager", "product"],
      status: false,
    },
    {
      id: 5,
      firstName: "Robert",
      lastName: "Brown",
      email: "robert.brown@example.com",
      age: 42,
      isActive: false,
      tags: ["developer", "fullstack"],
      status: true,
    },
  ]);

  // Column configurations
  const columns: ColumnConfig[] = [
    {
      key: "id",
      header: "ID",
      type: "number",
      width: "80px",
    },
    {
      key: "firstName",
      header: "First Name",
      type: "string",
      sortable: true,
      filterable: true,
    },
    {
      key: "lastName",
      header: "Last Name",
      type: "string",
      sortable: true,
      filterable: true,
    },
    {
      key: "email",
      header: "Email",
      type: "string",
      sortable: true,
      filterable: true,
    },
    {
      key: "age",
      header: "Age",
      type: "number",
      sortable: true,
    },
    {
      key: "isActive",
      header: "Active",
      type: "boolean",
      sortable: true,
    },
    {
      key: "tags",
      header: "Tags",
      type: "array",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      header: "Status",
      type: "switch",
      sortable: true,
    },
  ];

  // Action items for the action column
  const actionItems: ActionItem[] = [
    {
      label: "View",
      icon: <Eye className="w-4 h-4" />,
      onClick: (record) => {
        console.log("View", record);
        alert(`Viewing ${record.firstName} ${record.lastName}`);
      },
    },
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record) => {
        console.log("Edit", record);
        alert(`Editing ${record.firstName} ${record.lastName}`);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record) => {
        console.log("Delete", record);
        if (window.confirm(`Are you sure you want to delete ${record.firstName} ${record.lastName}?`)) {
          setData(data.filter(item => item.id !== record.id));
        }
      },
      isVisible: (record) => record.isActive, // Only show delete for active users
    },
  ];

  // Example pagination
  const pagination = {
    pageSize: 10,
    currentPage: 1,
    totalItems: data.length,
    onPageChange: (page: number) => {
      console.log("Page changed to", page);
    },
  };

  // Handle row click
  const handleRowClick = (record: Record<string, any>) => {
    console.log("Row clicked", record);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dynamic Table Example</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Table with Actions</h2>
        <DynamicTable
          data={data}
          columns={columns}
          hasActions={true}
          actionItems={actionItems}
          onRowClick={handleRowClick}
          pagination={pagination}
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Table without Actions</h2>
        <DynamicTable
          data={data}
          columns={columns}
          hasActions={false}
          pagination={pagination}
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Loading State</h2>
        <DynamicTable
          data={[]}
          columns={columns}
          isLoading={true}
          hasActions={true}
          actionItems={actionItems}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Empty Table</h2>
        <DynamicTable
          data={[]}
          columns={columns}
          hasActions={true}
          actionItems={actionItems}
        />
      </div>
    </div>
  );
};

export default DynamicTableExample;