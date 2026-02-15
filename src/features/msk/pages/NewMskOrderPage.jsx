// Toast
import { toast } from "sonner";

// API
import { authAPI, mskAPI } from "@/shared/api/http";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import StepBars from "@/shared/components/ui/StepBars";
import BackHeader from "@/shared/components/layout/BackHeader";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const NewMskOrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const categoryId = searchParams.get("category");

  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authAPI.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["msk", "categories"],
    queryFn: () => mskAPI.getCategories().then((res) => res.data),
  });

  const category = categories.find((c) => c._id === categoryId);

  const {
    step,
    setField,
    state: form,
  } = useObjectState({
    step: 1,
    description: "",
    contactPhone: user?.phone || "",
    contactLastName: user?.lastName || "",
    contactFirstName: user?.firstName || "",
  });

  const submitMutation = useMutation({
    mutationFn: (data) => mskAPI.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      toast.success("Buyurtma muvaffaqiyatli yuborildi!");
      navigate("/msk/my-orders");
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
        return toast.error("Buyurtma tavsifini kiriting");
      }

      setField("step", 2);
    } else {
      if (!form.contactFirstName.trim())
        return toast.error("Ismingizni kiriting");
      if (!form.contactLastName.trim())
        return toast.error("Familiyangizni kiriting");
      if (!form.contactPhone.trim())
        return toast.error("Telefon raqamni kiriting");

      submitMutation.mutate({ categoryId, ...form });
    }
  };

  return (
    <div className="min-h-screen space-y-5 animate__animated animate__fadeIn">
      {/* Header */}
      <BackHeader
        href="/msk"
        title={"Yangi buyurtma - " + (category?.name || "MSK")}
      />

      <div className="container space-y-5">
        {/* Step indicator */}
        <StepBars
          totalSteps={2}
          currentStep={step}
          inactiveClassName="bg-gray-200"
        />

        <div key={step} className="animate__animated animate__fadeIn">
          {step === 1 ? (
            <Card title="Buyurtma tavsifi">
              <textarea
                rows={12}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Kerakli xizmatni batafsil tavsiflang..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </Card>
          ) : (
            <Card title="Aloqa ma'lumotlari">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Ism</label>
                  <input
                    type="text"
                    value={form.contactFirstName}
                    onChange={(e) =>
                      setField("contactFirstName", e.target.value)
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
                      setField("contactLastName", e.target.value)
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
                    onChange={(e) => setField("contactPhone", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-3 mt-6">
            {/* Back Button */}
            {step === 2 && (
              <button
                type="button"
                onClick={() => setField("step", 1)}
                className="w-full bg-gray-200 py-2.5 rounded-lg font-medium"
              >
                Ortga
              </button>
            )}

            {/* Submit Button */}
            <button
              onClick={handleNext}
              disabled={submitMutation.isPending}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {step === 1 ? "Keyingi" : "Yuborish"}
              {submitMutation.isPending && "..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMskOrderPage;
