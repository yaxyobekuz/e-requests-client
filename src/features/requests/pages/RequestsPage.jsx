import { Link, useNavigate } from "react-router-dom";
import { REQUEST_CATEGORIES } from "@/shared/data/request-categories";
import { Building2, Users, Banknote, ArrowLeft, FileText } from "lucide-react";

const ICONS = { Building2, Users, Banknote };

const RequestsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Murojaatlar</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-4">
          Bo'limni tanlang va murojaatingizni yuboring
        </p>

        <div className="space-y-3 mb-6">
          {REQUEST_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon] || FileText;
            return (
              <Link
                key={cat.id}
                to={`/requests/new?category=${cat.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">{cat.label}</p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          to="/requests/my"
          className="flex items-center justify-center gap-2 w-full py-3 border border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Mening arizalarim
        </Link>
      </div>
    </div>
  );
};

export default RequestsPage;
