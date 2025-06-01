/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";
import Sidebar from "../components/Sidebar";
import sidebarConfig from "../routes/sidebar";
import { useTheme } from "../context/ThemeContext";
import type { SidebarItem } from "../types/route";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentPageTitle, setCurrentPageTitle] = useState(
    sidebarConfig?.[0]?.id
  );
  const [currentPageIcon, setCurrentPageIcon] = useState<React.ReactNode | any>(
    <LayoutDashboard size={24} />
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("privileges");
    localStorage.removeItem("user");
    navigate("/auth/login", { replace: true });
    window.location.reload();
  };

  // Update the useEffect to store the icon component properly
  useEffect(() => {
    const currentPath = location.pathname;

    // Find the matching sidebar item to get the label and icon
    const findItemByPath = (
      items: SidebarItem[]
    ): { label: string; icon: React.ReactNode | any } | null => {
      for (const item of items) {
        if (item.path === currentPath) {
          return { label: item.label, icon: item.icon };
        }
        if (item.children) {
          const childItem = findItemByPath(item.children);
          if (childItem) return childItem;
        }
      }
      return null;
    };

    const pageInfo = findItemByPath(sidebarConfig);
    if (pageInfo) {
      setCurrentPageTitle(pageInfo.label);
      // Store the icon component properly
      if (pageInfo.icon) {
        const IconComponent = pageInfo.icon;
        setCurrentPageIcon(<IconComponent size={24} />);
      }
    } else {
      setCurrentPageTitle(sidebarConfig?.[0]?.id);
      setCurrentPageIcon(<LayoutDashboard size={24} />);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        items={sidebarConfig}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />

      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <div className="mr-3 text-primary dark:text-white">
                {currentPageIcon}
              </div>
              <h1 className="text-2xl font-bold text-primary dark:text-white">
                {currentPageTitle}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  className="flex items-center text-gray-700 dark:text-gray-200 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <span className="mr-2">Logout</span>
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                Loading...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        <footer className="bg-white dark:bg-gray-800 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} E-BITS CMS Admin. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
