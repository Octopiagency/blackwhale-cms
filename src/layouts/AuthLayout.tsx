import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
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

        {/* <footer className="bg-white dark:bg-gray-800 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} CMS Admin. All rights reserved.
          </div>
        </footer> */}
      </div>
    </div>
  );
};

export default AuthLayout;
