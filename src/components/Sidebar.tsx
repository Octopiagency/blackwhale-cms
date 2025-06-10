import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, Store } from "lucide-react";
import type { SidebarItem } from "../types/route";

interface SidebarProps {
  items: SidebarItem[];
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ items, isCollapsed, toggleSidebar }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen fixed left-0 top-0 z-10 border-r border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Store size={24} className="text-primary" />
            <h1 className="text-xl font-bold">E-BITS</h1>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      <nav className="py-4">
        <ul>
          {items.map((item) => (
            <li key={item.id} className="mb-1">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center w-full px-4 py-2 text-left  hover:bg-primary hover:text-white dark:hover:text-primary dark:hover:bg-gray-700 focus:outline-none ${
                      isCollapsed ? "justify-center" : "justify-between"
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <span className="flex-shrink-0">
                          {<item.icon size={20} />}
                        </span>
                      )}
                      <span className={`${isCollapsed ? "sr-only" : "ml-2"}`}>
                        {item.label}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={`transition-transform ${
                          expandedItems[item.id] ? "rotate-180" : ""
                        }`}
                        size={18}
                      />
                    )}
                  </button>
                  {expandedItems[item.id] && !isCollapsed && (
                    <ul className="pl-4 mt-1">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.path || "#"}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 hover:bg-primary hover:text-white dark:hover:text-primary dark:hover:bg-gray-700 ${
                                isActive
                                  ? "bg-primary text-white dark:text-primary dark:bg-gray-700"
                                  : ""
                              }`
                            }
                          >
                            {child.icon && (
                              <span className="flex-shrink-0">
                                {<child.icon size={18} />}
                              </span>
                            )}
                            <span className="ml-2">{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path || "#"}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 hover:bg-primary hover:text-white dark:hover:text-primary dark:hover:bg-gray-700 ${
                      isActive
                        ? "bg-primary text-white dark:text-primary dark:bg-gray-700"
                        : ""
                    } ${isCollapsed ? "justify-center" : ""}`
                  }
                >
                  {item.icon && (
                    <span className="flex-shrink-0">
                      {<item.icon size={20} />}
                    </span>
                  )}
                  <span className={`${isCollapsed ? "sr-only" : "ml-2"}`}>
                    {item.label}
                  </span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
