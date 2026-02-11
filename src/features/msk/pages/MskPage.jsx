import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mskAPI } from "@/shared/api/http";
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import { useDispatch } from "react-redux";
import { open } from "@/features/modal/store/modal.slice";
import {
  ArrowLeft,
  Plug,
  Wrench,
  Shovel,
  Lightbulb,
  Hammer,
  TreeDeciduous,
  Construction,
  SprayCan,
  HelpCircle,
  Plus,
  ClipboardList,
} from "lucide-react";

const ICON_MAP = {
  Plug,
  Wrench,
  Shovel,
  Lightbulb,
  Hammer,
  TreeDeciduous,
  Construction,
  SprayCan,
};

const MskPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [view, setView] = useState("categories"); // categories | orders

  const { data: categories = [] } = useQuery({
    queryKey: ["msk", "categories"],
    queryFn: () => mskAPI.getCategories().then((res) => res.data),
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ["msk", "orders", "my"],
    queryFn: () => mskAPI.getMyOrders().then((res) => res.data),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, confirmed }) =>
      mskAPI.confirmOrder(id, { confirmed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      toast.success("Javobingiz qabul qilindi!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const openOrderModal = (category) => {
    dispatch(open({ modal: "mskOrder", data: { category } }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">MSK</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Tab switch */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView("categories")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "categories"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Buyurtma berish
          </button>
          <button
            onClick={() => setView("orders")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "orders"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1" />
            Buyurtmalarim
          </button>
        </div>

        {view === "categories" ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || HelpCircle;
              return (
                <button
                  key={cat._id}
                  onClick={() => openOrderModal(cat)}
                  className="bg-white rounded-xl border p-4 text-center hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-sm font-medium">{cat.name}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Hozircha buyurtmalar yo'q</p>
              </div>
            ) : (
              myOrders.map((order) => {
                const status = MSK_ORDER_STATUSES[order.status] || {};
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          {order.category?.name}
                        </span>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">
                      {order.description}
                    </p>

                    {order.status === "resolved" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            confirmMutation.mutate({
                              id: order._id,
                              confirmed: true,
                            })
                          }
                          disabled={confirmMutation.isPending}
                          className="flex-1 py-1.5 text-xs bg-green-600 text-white rounded-lg"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() =>
                            confirmMutation.mutate({
                              id: order._id,
                              confirmed: false,
                            })
                          }
                          disabled={confirmMutation.isPending}
                          className="flex-1 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg"
                        >
                          Rad etish
                        </button>
                      </div>
                    )}

                    {order.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-700">
                        <span className="font-medium">Sabab: </span>
                        {order.rejectionReason}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Order Modal */}
      <ModalWrapper name="mskOrder" title="Yangi buyurtma">
        <MskOrderForm />
      </ModalWrapper>
    </div>
  );
};

const MskOrderForm = ({ category, close, isLoading, setIsLoading }) => {
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Tavsifni kiriting");

    setIsLoading(true);
    try {
      await mskAPI.createOrder({
        categoryId: category?._id,
        description,
      });
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      toast.success("Buyurtma yuborildi!");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Kategoriya:{" "}
        <span className="font-medium text-gray-700">{category?.name}</span>
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">
          Buyurtma tavsifi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Kerakli xizmatni batafsil tavsiflang..."
          className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Yuborilmoqda..." : "Yuborish"}
      </button>
    </form>
  );
};

export default MskPage;
