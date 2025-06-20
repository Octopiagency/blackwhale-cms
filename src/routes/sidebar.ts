import { dataLocalStorage, getLocalStorage } from "../helper/public-functions";
import type { SidebarItem } from "../types/route";
import {
  User,
  User2,
  List,
  Plus,
  Store,
  LayoutDashboard,
  ListOrdered,
} from "lucide-react";

// Get privileges from local storage
const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
console.log("privileges 2 : ", privileges);

// Helper function to check access rights
const hasAccess = (
  id: string,
  accessType: "access_read" | "access_write" | "access_edit" | "access_delete"
) => {
  return privileges[id]?.[accessType] === 1;
};

// Helper function to check if user can create/edit
const canCreateOrEdit = (id: string) => {
  return hasAccess(id, "access_write") || hasAccess(id, "access_edit");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sidebarConfig: SidebarItem[] | any = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  {
    id: "order",
    label: "Orders",
    icon: ListOrdered,
    children: [
      hasAccess("683f29b1407422c78b3e1a75", "access_read") && {
        id: "order-list",
        label: "Order List",
        icon: List,
        path: "/order/list", // Fixed: Added  prefix
      },
      canCreateOrEdit("683f29b1407422c78b3e1a75") && {
        id: "create-order",
        label: "Create Order",
        icon: Plus,
        path: "/order/create", // Fixed: Added  prefix
      },
    ].filter(Boolean),
  },

  // Categories
  hasAccess("67e02b185c11ef3c4ed376ff", "access_read") && {
    id: "categories",
    label: "Categories",
    icon: User,
    path: "/categories", // Fixed: Added  prefix
  },
  hasAccess("683c4bd1f7bd2dc5e3ab504b", "access_read") && {
    id: "sub-categories",
    label: "Sub Categories",
    icon: User,
    path: "/sub-categories", // Fixed: Added  prefix
  },

  // Store
  {
    id: "store",
    label: "Store",
    icon: Store,
    children: [
      hasAccess("67e09fadc0be3c16353c1078", "access_read") && {
        id: "store-list",
        label: "Store List",
        icon: List,
        path: "/store/list", // Fixed: Added  prefix
      },
      canCreateOrEdit("67e09fadc0be3c16353c1078") && {
        id: "create-store",
        label: "Create Store",
        icon: Plus,
        path: "/store/create", // Fixed: Added  prefix
      },
    ].filter(Boolean),
  },

  // Products
  {
    id: "products",
    label: "Products",
    icon: Store,
    children: [
      hasAccess("67e1e4fbdf4aaa02c3651bcb", "access_read") && {
        id: "products-list",
        label: "Products List",
        icon: List,
        path: "/products/list", // Fixed: Added  prefix
      },
      canCreateOrEdit("67e1e4fbdf4aaa02c3651bcb") && {
        id: "create-product",
        label: "Create Product",
        icon: Plus,
        path: "/products/create", // Fixed: Added  prefix
      },
    ].filter(Boolean),
  },

  {
    id: "users",
    label: "Users",
    icon: User2,
    children: [
      hasAccess("6849aead3a2fe2c7a1b09cea", "access_read") && {
        id: "user",
        label: "Users List",
        icon: List,
        path: "/user/list", // Fixed: Added  prefix
      },
      canCreateOrEdit("6849aead3a2fe2c7a1b09cea") && {
        id: "createUser",
        label: "Create user",
        icon: Plus,
        path: "/user/create", // Fixed: Added  prefix
      },
    ].filter(Boolean),
  },

  // Admin Types
  {
    id: "adminTypes",
    label: "Admin Types",
    icon: User2,
    children: [
      hasAccess("67e0256b409e8cd34ba64468", "access_read") && {
        id: "adminTypesList",
        label: "Admin Types List",
        icon: List,
        path: "/admin-types/list", // Fixed: Added  prefix
      },
      canCreateOrEdit("67e0256b409e8cd34ba64468") && {
        id: "createAdminType",
        label: "Create Admin Type",
        icon: Plus,
        path: "/admin-types/create", // Fixed: Added  prefix
      },
    ].filter(Boolean),
  },

  // Admins
  hasAccess("67e020fa75e4b7db87590c8e", "access_read") && {
    id: "admins",
    label: "Admins",
    icon: User,
    path: "/admins", // Fixed: Added  prefix
  },
].filter(Boolean);

export default sidebarConfig;
