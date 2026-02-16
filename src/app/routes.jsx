// Layouts
import RootLayout from "@/shared/layouts/RootLayout.jsx";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";
import RegionGuard from "@/shared/components/guards/RegionGuard";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

// Pages
import MyPage from "@/features/my/pages/MyPage";
import HomePage from "@/features/home/pages/HomePage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import ServicesPage from "@/features/services/pages/ServicesPage";
import RequestsPage from "@/features/requests/pages/RequestsPage";
import MskMyOrdersPage from "@/features/msk/pages/MskMyOrdersPage";
import NewMskOrderPage from "@/features/msk/pages/NewMskOrderPage";
import EditMskOrderPage from "@/features/msk/pages/EditMskOrderPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import NewRequestPage from "@/features/requests/pages/NewRequestPage";
import MyRequestsPage from "@/features/requests/pages/MyRequestsPage";
import RegionSetupPage from "@/features/regions/pages/RegionSetupPage";
import ProfileEditPage from "@/features/profile/pages/ProfileEditPage";
import MskCategoriesPage from "@/features/msk/pages/MskCategoriesPage";
import EditRequestPage from "@/features/requests/pages/EditRequestPage";
import MskOrderDetailPage from "@/features/msk/pages/MskOrderDetailPage";
import GetStartedPage from "@/features/get-started/pages/GetStartedPage";
import RequestDetailPage from "@/features/requests/pages/RequestDetailPage";
import MyServiceReportsPage from "@/features/services/pages/MyServiceReportsPage";

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
            <Route path="/requests/edit/:id" element={<EditRequestPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/services/my-reports"
              element={<MyServiceReportsPage />}
            />
            <Route path="/my" element={<MyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/msk" element={<MskCategoriesPage />} />
            <Route path="/msk/new" element={<NewMskOrderPage />} />
            <Route path="/msk/my-orders" element={<MskMyOrdersPage />} />
            <Route path="/msk/edit/:id" element={<EditMskOrderPage />} />
            <Route path="/msk/orders/:id" element={<MskOrderDetailPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
