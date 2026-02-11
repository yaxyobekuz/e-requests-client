import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authAPI, requestsAPI } from "@/shared/api/http";
import { REQUEST_CATEGORIES } from "@/shared/data/request-categories";
import { ArrowLeft } from "lucide-react";

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "infrastructure";
  const category = REQUEST_CATEGORIES.find((c) => c.id === categoryId);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    description: "",
    contactFirstName: "",
    contactLastName: "",
    contactPhone: "",
  });

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Default qiymatlarni o'rnatish
  useState(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        contactFirstName: prev.contactFirstName || user.firstName || "",
        contactLastName: prev.contactLastName || user.lastName || "",
        contactPhone: prev.contactPhone || user.phone || "",
      }));
    }
  }, [user]);

  const submitMutation = useMutation({
    mutationFn: (data) => requestsAPI.create(data),
    onSuccess: () => {
      toast.success("Murojaat muvaffaqiyatli yuborildi!");
      navigate("/requests/my");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Yuborishda xatolik yuz berdi",
      );
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!form.description.trim()) {
        return toast.error("Muammo tavsifini kiriting");
      }
      // Default qiymatlarni user dan olish
      if (user) {
        setForm((prev) => ({
          ...prev,
          contactFirstName: prev.contactFirstName || user.firstName || "",
          contactLastName: prev.contactLastName || user.lastName || "",
          contactPhone: prev.contactPhone || user.phone || "",
        }));
      }
      setStep(2);
    } else {
      if (!form.contactFirstName.trim())
        return toast.error("Ismingizni kiriting");
      if (!form.contactLastName.trim())
        return toast.error("Familiyangizni kiriting");
      if (!form.contactPhone.trim())
        return toast.error("Telefon raqamni kiriting");

      submitMutation.mutate({
        category: categoryId,
        ...form,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => (step === 1 ? navigate("/requests") : setStep(1))}
            className="p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">
            {category?.label || "Murojaat"} — Yangi ariza
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`flex-1 h-1 rounded ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}
          />
          <div
            className={`flex-1 h-1 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
          />
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          {step === 1 ? (
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Muammoingizni tavsiflang
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Muammoni batafsil yozing
              </p>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={6}
                placeholder="Muammoingiz haqida batafsil yozing..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Aloqa ma'lumotlari
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Ma'lumotlaringizni tekshiring
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Ism</label>
                  <input
                    type="text"
                    value={form.contactFirstName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contactFirstName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Familiya
                  </label>
                  <input
                    type="text"
                    value={form.contactLastName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contactLastName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefon raqam
                  </label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={submitMutation.isPending}
            className="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitMutation.isPending
              ? "Yuborilmoqda..."
              : step === 1
                ? "Keyingi"
                : "Yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRequestPage;
