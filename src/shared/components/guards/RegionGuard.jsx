import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/shared/api/http";

const RegionGuard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (data && !data.address) {
    return <Navigate to="/region-setup" replace />;
  }

  return <Outlet />;
};

export default RegionGuard;
