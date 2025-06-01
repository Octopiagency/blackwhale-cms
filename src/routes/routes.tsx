/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import type { RouteItem } from "../types/route";
import ProtectedRoute from "../components/ProtectedRoutes";
import PublicRoute from "../components/PublicRoute";
import CategoriesPage from "../pages/categories/categories-page";
import Dashboard from "../pages/Dashboard";

// Layouts
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));

// Pages
const Login = lazy(() => import("../pages/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));
const AddPrivileges = lazy(() => import("../pages/privilegs/create-privilegs"));
const PrivilegsPage = lazy(() => import("../pages/privilegs/privilegs-page"));
const Admins = lazy(() => import("../pages/admins-page/Admins"));

const CreateStorePage = lazy(() => import("../pages/store/create-store"));
const StoreListPage = lazy(() => import("../pages/store/store-list"));
const CreateProductPage = lazy(
  () => import("../pages/products/create-product")
);
const ProductListPage = lazy(() => import("../pages/products/products-list"));

// Helper function to check access rights
const hasAccess = (
  privileges: Record<string, any>,
  id: string,
  accessType: "access_read" | "access_write" | "access_edit" | "access_delete"
) => {
  return privileges[id]?.[accessType] === 1;
};

// Helper function to check if user can create/edit
const canCreateOrEdit = (privileges: Record<string, any>, id: string) => {
  return (
    hasAccess(privileges, id, "access_write") ||
    hasAccess(privileges, id, "access_edit")
  );
};

// Helper function to create route with permission check
const createProtectedRoute = (
  condition: boolean,
  route: Omit<RouteItem, "children">
): RouteItem | null => {
  return condition ? route : null;
};

export function generateRoutes(privileges: Record<string, any>): any[] {
  console.log("Generating routes with privileges:", privileges);

  return [
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      ),
      index: true,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        // Categories
        createProtectedRoute(
          hasAccess(privileges, "67e02b185c11ef3c4ed376ff", "access_read"),
          {
            path: "categories",
            element: <CategoriesPage />,
          }
        ),

        // Store routes
        createProtectedRoute(
          hasAccess(privileges, "67e09fadc0be3c16353c1078", "access_read"),
          {
            path: "store/list",
            element: <StoreListPage />,
          }
        ),
        createProtectedRoute(
          canCreateOrEdit(privileges, "67e09fadc0be3c16353c1078"),
          {
            path: "store/create/:id?",
            element: <CreateStorePage />,
          }
        ),

        // Products routes
        createProtectedRoute(
          hasAccess(privileges, "67e1e4fbdf4aaa02c3651bcb", "access_read"),
          {
            path: "products/list",
            element: <ProductListPage />,
          }
        ),
        createProtectedRoute(
          canCreateOrEdit(privileges, "67e1e4fbdf4aaa02c3651bcb"),
          {
            path: "products/create/:id?",
            element: <CreateProductPage />,
          }
        ),

        // Admin types routes
        createProtectedRoute(
          hasAccess(privileges, "67e0256b409e8cd34ba64468", "access_read"),
          {
            path: "admin-types/list",
            element: <PrivilegsPage />,
          }
        ),
        createProtectedRoute(
          canCreateOrEdit(privileges, "67e0256b409e8cd34ba64468"),
          {
            path: "admin-types/create/:id?",
            element: <AddPrivileges />,
          }
        ),

        // Admins route
        createProtectedRoute(
          hasAccess(privileges, "67e020fa75e4b7db87590c8e", "access_read"),
          {
            path: "admins",
            element: <Admins />,
          }
        ),
      ].filter((route): route is RouteItem => route !== null),
    },
    {
      path: "/auth",
      element: (
        <PublicRoute>
          <AuthLayout />
        </PublicRoute>
      ),
      children: [
        {
          path: "login",
          element: <Login />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];
}
