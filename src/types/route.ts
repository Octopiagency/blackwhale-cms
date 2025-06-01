import type { LucideIcon } from "lucide-react";

export interface RouteItem {
  path: string;
  element: React.ReactNode;
  children?: RouteItem[];
  index?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  children?: SidebarItem[];
  // Add these optional properties to specify required permissions
  requiredPermission?: "read" | "write" | "update" | "delete";
  pageType?: "list" | "create" | "edit" | "view";
}
