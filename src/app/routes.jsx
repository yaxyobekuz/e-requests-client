// Pages
import HomePage from "@/features/home/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import RequestsPage from "@/features/requests/pages/RequestsPage";
import NewRequestPage from "@/features/requests/pages/NewRequestPage";
import MyRequestsPage from "@/features/requests/pages/MyRequestsPage";
import ServicesPage from "@/features/services/pages/ServicesPage";
import MyServiceReportsPage from "@/features/services/pages/MyServiceReportsPage";
import MskPage from "@/features/msk/pages/MskPage";
import RegionSetupPage from "@/features/regions/pages/RegionSetupPage";
import GetStartedPage from "@/features/get-started/pages/GetStartedPage";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";
import RegionGuard from "@/shared/components/guards/RegionGuard";

// Layouts
import RootLayout from "@/shared/layouts/RootLayout.jsx";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/get-started/:stepNumber?" element={<GetStartedPage />} />

      {/* Guest only routes */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route path="/region-setup" element={<RegionSetupPage />} />

        {/* Region required routes */}
        <Route element={<RegionGuard />}>
          <Route element={<RootLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/new" element={<NewRequestPage />} />
            <Route path="/requests/my" element={<MyRequestsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/my-reports" element={<MyServiceReportsPage />} />
            <Route path="/msk" element={<MskPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
