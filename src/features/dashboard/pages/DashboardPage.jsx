import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/shared/api/http";
import {
  FileText,
  Settings,
  Wrench,
  LogOut,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/requests",
    label: "Murojaatlar",
    description: "Ariza va murojaatlaringizni yuborin",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    to: "/services",
    label: "Servislar",
    description: "Kundalik xizmatlar holati",
    icon: Settings,
    color: "bg-green-50 text-green-600",
  },
  {
    to: "/msk",
    label: "MSK",
    description: "Maishiy xizmatlar buyurtmasi",
    icon: Wrench,
    color: "bg-orange-50 text-orange-600",
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {user?.firstName || "Foydalanuvchi"}
              </p>
              <p className="text-xs text-gray-500">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-1">Bosh sahifa</h1>
        <p className="text-gray-500 text-sm mb-6">
          Kerakli bo'limni tanlang
        </p>

        <div className="space-y-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
