// Toaster
import { toast } from "sonner";

// API
import { mskAPI } from "@/shared/api/http";

// React
import { useEffect, useMemo, useRef } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import StepBars from "@/shared/components/ui/StepBars";
import BackHeader from "@/shared/components/layout/BackHeader";

// Router
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Tanstack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const EditMskOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  const stateOrder = location.state?.order || null;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["msk", "orders", "my"],
    queryFn: () => mskAPI.getMyOrders().then((res) => res.data),
    enabled: !stateOrder,
  });

  const order = useMemo(() => {
    return stateOrder || orders.find((item) => item._id === id) || null;
  }, [stateOrder, orders, id]);

  const {
    step,
    setField,
    setFields,
    state: form,
  } = useObjectState({
    step: 1,
    description: "",
    contactPhone: "",
    contactLastName: "",
    contactFirstName: "",
  });

  useEffect(() => {
    if (!order || initializedRef.current) return;

    setFields({
      description: order.description || "",
      contactPhone: order.contactPhone || "",
      contactLastName: order.contactLastName || "",
      contactFirstName: order.contactFirstName || "",
    });

    initializedRef.current = true;
  }, [order, setFields]);

  const updateMutation = useMutation({
    mutationFn: (payload) => mskAPI.updateOrder(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      toast.success("Buyurtma yangilandi!");
      navigate("/msk/my-orders");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Yangilashda xatolik yuz berdi",
      );
    },
  });

  const canEdit = order?.status === "pending";

  const handleNext = () => {
    if (!order) return;

    if (step === 1) {
      if (!form.description.trim()) {
        return toast.error("Buyurtma tavsifini kiriting");
      }

      setField("step", 2);
      return;
    }

    if (!form.contactFirstName.trim())
      return toast.error("Ismingizni kiriting");
    if (!form.contactLastName.trim())
      return toast.error("Familiyangizni kiriting");
    if (!form.contactPhone.trim())
      return toast.error("Telefon raqamni kiriting");

    updateMutation.mutate({
      id: order._id,
      data: {
        description: form.description,
        contactFirstName: form.contactFirstName,
        contactLastName: form.contactLastName,
        contactPhone: form.contactPhone,
      },
    });
  };

  return (
    <div className="min-h-screen space-y-5 animate__animated animate__fadeIn">
      <BackHeader
        href="/msk/my-orders"
        title={`Buyurtmani tahrirlash - ${order?.category?.name || "MSK"}`}
      />

      <div className="container space-y-5">
        {isLoading && !order && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && !order && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Buyurtma topilmadi</p>
            <button
              onClick={() => navigate("/msk/my-orders")}
              className="text-blue-600 hover:underline text-sm"
            >
              Buyurtmalarimga qaytish
            </button>
          </div>
        )}

        {order && (
          <>
            <StepBars
              totalSteps={2}
              currentStep={step}
              inactiveClassName="bg-gray-200"
            />

            {!canEdit && (
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm">
                Faqat "Kutilmoqda" holatidagi buyurtmalarni tahrirlash mumkin.
              </div>
            )}

            <div key={step} className="animate__animated animate__fadeIn">
              {step === 1 ? (
                <Card title="Buyurtma tavsifi">
                  <textarea
                    rows={12}
                    value={form.description}
                    disabled={!canEdit}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Kerakli xizmatni batafsil tavsiflang..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </Card>
              ) : (
                <Card title="Aloqa ma'lumotlari">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ism
                      </label>
                      <input
                        type="text"
                        value={form.contactFirstName}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setField("contactFirstName", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Familiya
                      </label>
                      <input
                        type="text"
                        value={form.contactLastName}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setField("contactLastName", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Telefon raqam
                      </label>
                      <input
                        type="text"
                        value={form.contactPhone}
                        disabled={!canEdit}
                        onChange={(e) =>
                          setField("contactPhone", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex items-center gap-3 mt-6">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setField("step", 1)}
                    className="w-full bg-gray-200 py-2.5 rounded-lg font-medium"
                  >
                    Ortga
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canEdit || updateMutation.isPending}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {step === 1 ? "Keyingi" : "Saqlash"}
                  {updateMutation.isPending && "..."}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditMskOrderPage;
