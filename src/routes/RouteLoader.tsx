"use client";

import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { dataLocalStorage, getLocalStorage } from "../helper/public-functions";
import { generateRoutes } from "./routes";
import { useAuth } from "../context/AuthContext";

export function RouteLoader() {
  const { isAuthenticated, isLoading } = useAuth();
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);

  useEffect(() => {
    // Don't create router until auth loading is complete
    if (isLoading) return;

    // Get privileges from localStorage
    const privileges = getLocalStorage(dataLocalStorage.privileges) || {};
    console.log("Privileges loaded in RouteLoader:", privileges);

    // Create router with current privileges
    const routerInstance = createBrowserRouter(generateRoutes(privileges));
    setRouter(routerInstance);
  }, [isAuthenticated, isLoading]);

  // Re-check privileges when they might have changed
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const handlePrivilegeUpdate = () => {
      const updatedPrivileges =
        getLocalStorage(dataLocalStorage.privileges) || {};
      console.log("Privileges updated:", updatedPrivileges);
      setRouter(createBrowserRouter(generateRoutes(updatedPrivileges)));
    };

    // Listen for custom events when privileges are updated
    window.addEventListener("privilegesUpdated", handlePrivilegeUpdate);

    // Also listen for storage events (in case privileges are updated in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === dataLocalStorage.privileges) {
        handlePrivilegeUpdate();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("privilegesUpdated", handlePrivilegeUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated, isLoading]);

  // Show loading until auth check is complete and router is ready
  if (isLoading || !router) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
