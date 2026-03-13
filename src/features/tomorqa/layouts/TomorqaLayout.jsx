
// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { NavLink, Outlet } from "react-router-dom";

// API
import { tomorqaAPI } from "@/features/tomorqa/api";

// Components
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { TOMORQA_TABS } from "@/features/tomorqa/data/tomorqa.data";

const TomorqaLayout = () => {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => tomorqaAPI.getProducts().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen pb-24 animate__animated animate__fadeIn">
      <BackHeader href="/dashboard" title="Mening tomorqam" />

      <div className="sticky top-16 z-10 bg-white shadow-sm border-gray-100 pb-2.5">
        <div className="flex gap-2 container">
          {TOMORQA_TABS.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={({ isActive }) =>
                `flex-1 py-2 rounded-full text-sm font-medium transition-colors text-center ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="container py-5 space-y-5">
        {productsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <Outlet context={{ products }} />
        )}
      </div>
    </div>
  );
};

export default TomorqaLayout;
