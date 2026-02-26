// Router
import { Link } from "react-router-dom";

// API
import { usersAPI } from "@/shared/api/http";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/shadcn/button";
import BottomNavbar from "@/shared/components/ui/BottomNavbar";
import { LogOut } from "lucide-react";

const ProfilePage = () => {
  const {
    isError,
    isLoading,
    data: profile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => usersAPI.getProfile().then((res) => res.data),
  });

  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ");

  const displayName = profile?.alias || fullName || "Foydalanuvchi";
  const roleLabel =
    profile?.role === "admin"
      ? "Admin"
      : profile?.role === "owner"
        ? "Rahbar"
        : "Foydalanuvchi";

  const address = profile?.address || null;
  const regionName = address?.region?.name || "-";
  const districtName = address?.district?.name || "-";
  const neighborhoodName =
    address?.neighborhood?.name || address?.neighborhoodCustom || "-";
  const streetName = address?.street?.name || address?.streetCustom || "-";
  const houseNumber = address?.houseNumber || "-";
  const apartmentNumber = address?.apartment?.trim() || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen pt-5 pb-20 space-y-5 animate__animated animate__fadeIn">
      <div className="container space-y-5">
        {/* Top */}
        <h1 className="text-blue-500 font-bold text-xl">Profil</h1>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {isError && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            Profil ma'lumotlarini yuklab bo'lmadi
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Card title="Umumiy ma'lumotlar" className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ism</span>
                <span className="font-medium text-gray-900">{displayName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Telefon</span>
                <span className="font-medium text-gray-900">
                  {profile?.phone || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Roli</span>
                <span className="font-medium text-gray-900">{roleLabel}</span>
              </div>
            </Card>

            <Card title="Hudud ma'lumotlari" className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Viloyat</span>
                <span className="font-medium text-gray-900">{regionName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tuman/Shahar</span>
                <span className="font-medium text-gray-900">
                  {districtName}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Mahalla</span>
                <span className="font-medium text-gray-900">
                  {neighborhoodName}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ko'cha</span>
                <span className="font-medium text-gray-900">{streetName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Uy raqami</span>
                <span className="font-medium text-gray-900">{houseNumber}</span>
              </div>

              {apartmentNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Xonadon</span>
                  <span className="font-medium text-gray-900">
                    {apartmentNumber}
                  </span>
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-3.5 xs:flex-row">
              <Button className="w-full" asChild>
                <Link to="/profile/edit">Tahrirlash</Link>
              </Button>

              <Button
                onClick={handleLogout}
                variant="danger"
                className="w-full"
              >
                Chiqish
              </Button>
            </div>
          </>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default ProfilePage;
