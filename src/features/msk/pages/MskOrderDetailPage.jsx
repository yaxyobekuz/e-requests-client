// React
import React, { useMemo } from "react";

// API
import { mskAPI } from "@/shared/api/http";

// Redux
import { open } from "@/features/modal";
import { useDispatch } from "react-redux";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/shadcn/button";
import BackHeader from "@/shared/components/layout/BackHeader";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";

// Tanstack Query
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Data
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";

// Router
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const MskOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const stateOrder = location.state?.order || null;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["msk", "orders", "my"],
    queryFn: () => mskAPI.getMyOrders().then((res) => res.data),
    enabled: !stateOrder,
  });

  const order = useMemo(() => {
    return stateOrder || orders.find((item) => item._id === id) || null;
  }, [stateOrder, orders, id]);

  const status = MSK_ORDER_STATUSES[order?.status] || {};

  const addressLine = useMemo(() => {
    if (!order?.address) return "";
    const address = order.address;
    const parts = [
      address.region?.name,
      address.district?.name,
      address.neighborhood?.name,
      address.neighborhoodCustom,
      address.street?.name,
      address.streetCustom,
      address.houseNumber ? `Uy ${address.houseNumber}` : "",
      address.apartment ? `Xonadon ${address.apartment}` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }, [order]);

  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: ({ confirmed }) => mskAPI.confirmOrder(order._id, { confirmed }),
    onSuccess: (_, { confirmed }) => {
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      toast.success(
        confirmed
          ? "Buyurtma tasdiqlandi!"
          : "Muammo hali hal etilmagan deb belgilandi",
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const canEdit = order?.status === "pending";
  const canCancel =
    order &&
    !["pending_confirmation", "confirmed", "rejected", "cancelled"].includes(order.status);

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/msk/my-orders" title="Buyurtma tafsilotlari" />

      <div className="container space-y-4">
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
            <Card>
              {/* Top */}
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-xs text-gray-500">{order.category?.name}</p>

                {/* Edit link */}
                {canEdit && (
                  <Link
                    state={{ order }}
                    to={`/msk/edit/${order._id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tahrirlash
                  </Link>
                )}
              </div>

              {/* Title */}
              <h2 className="font-semibold text-gray-900 mb-2 xs:mb-3 xs:text-lg">
                #{order._id} - raqamli buyurtma
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span
                  className={`px-2 py-0.5 rounded-full ${status.color || "bg-gray-100 text-gray-600"}`}
                >
                  {status.label || "Noma'lum"}
                </span>
                <span>{formatUzDate(order.createdAt)}</span>
              </div>
            </Card>

            <Card title="Buyurtma tavsifi">
              <p className="text-gray-800 whitespace-pre-line">
                {order.description}
              </p>
            </Card>

            <Card title="Aloqa ma'lumotlari">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Ism</span>
                  <span className="text-gray-800">
                    {order.contactFirstName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Familiya</span>
                  <span className="text-gray-800">{order.contactLastName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Telefon</span>
                  <span className="text-gray-800">{order.contactPhone}</span>
                </div>
              </div>
            </Card>

            <Card title="Manzil">
              <p className="text-sm text-gray-700">
                {addressLine || "Manzil ko'rsatilmagan"}
              </p>
            </Card>

            {order.status === "rejected" && order.rejectionReason && (
              <Card title="Rad etish sababi">
                <p className="text-sm text-gray-700">{order.rejectionReason}</p>
              </Card>
            )}

            {order.status === "cancelled" && order.cancelReason && (
              <Card title="Bekor qilish sababi">
                <p className="text-sm text-gray-700">{order.cancelReason}</p>
              </Card>
            )}

            {order.status === "pending_confirmation" && (
              <Card>
                <p className="text-gray-600 mb-4">
                  Admin muammoni bartaraf etilganini bildirdi. Tasdiqlaysizmi?
                </p>
                <div className="flex flex-col gap-3.5 xs:flex-row">
                  <Button
                    className="w-full"
                    onClick={() => confirmMutation.mutate({ confirmed: true })}
                    disabled={confirmMutation.isPending}
                  >
                    Ha
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => confirmMutation.mutate({ confirmed: false })}
                    disabled={confirmMutation.isPending}
                  >
                    Yo'q
                  </Button>
                </div>
              </Card>
            )}

            {canCancel && (
              <Button
                variant="danger"
                className="w-full"
                onClick={() =>
                  dispatch(open({ modal: "cancelOrder", data: order }))
                }
              >
                Buyurtmani bekor qilish
              </Button>
            )}

            <ModalWrapper
              name="cancelOrder"
              title="Buyurtmani bekor qilish"
              description="Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?"
            >
              <CancelOrderForm />
            </ModalWrapper>
          </>
        )}
      </div>
    </div>
  );
};

const CancelOrderForm = ({ _id, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = React.useState("");

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await mskAPI.cancelOrder(_id, {
        cancelReason: cancelReason.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["msk", "orders", "my"] });
      close();
      navigate("/msk/my-orders");
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        placeholder="Sabab (ixtiyoriy)"
        rows={3}
        className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
      />
      <div className="flex flex-col gap-3.5 xs:flex-row">
        <Button variant="secondary" className="w-full" onClick={close}>
          Yo'q
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {isLoading ? "Ha..." : "Ha"}
        </Button>
      </div>
    </div>
  );
};

export default MskOrderDetailPage;
