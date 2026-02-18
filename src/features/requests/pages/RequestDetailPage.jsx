// React
import React, { useMemo } from "react";

// API
import { requestsAPI } from "@/shared/api/http";

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
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Data
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
import { requestCategories } from "@/shared/data/request-categories";

// Router
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const stateRequest = location.state?.request || null;

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", "my"],
    queryFn: () => requestsAPI.getMyRequests().then((res) => res.data),
    enabled: !stateRequest,
  });

  const request = useMemo(() => {
    return stateRequest || requests.find((item) => item._id === id) || null;
  }, [stateRequest, requests, id]);

  const status = REQUEST_STATUSES[request?.status] || {};
  const categoryLabel = request
    ? requestCategories.find((c) => c.id === request.category)?.label ||
      request.category
    : "";

  const addressLine = useMemo(() => {
    if (!request?.address) return "";
    const address = request.address;
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
  }, [request]);

  const canEdit = request?.status === "pending";
  const canCancel =
    request && !["resolved", "rejected", "cancelled"].includes(request.status);

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/requests/my" title="Murojaat tafsilotlari" />

      <div className="container space-y-4">
        {isLoading && !request && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && !request && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Murojaat topilmadi</p>
            <button
              onClick={() => navigate("/requests/my")}
              className="text-blue-600 hover:underline text-sm"
            >
              Murojaatlarimga qaytish
            </button>
          </div>
        )}

        {request && (
          <>
            <Card>
              {/* Top */}
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-xs text-gray-500">{categoryLabel}</p>

                {/* Edit link */}
                {canEdit && (
                  <Link
                    state={{ request }}
                    to={`/requests/edit/${request._id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tahrirlash
                  </Link>
                )}
              </div>

              {/* Title */}
              <h2 className="font-semibold text-gray-900 mb-2 xs:mb-3 xs:text-lg">
                #{request._id} - raqamli murojaat
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span
                  className={`px-2 py-0.5 rounded-full ${status.color || "bg-gray-100 text-gray-600"}`}
                >
                  {status.label || "Noma'lum"}
                </span>
                <span>{formatUzDate(request.createdAt)}</span>
              </div>
            </Card>

            <Card title="Murojaat matni">
              <p className="text-gray-800 whitespace-pre-line">
                {request.description}
              </p>
            </Card>

            <Card title="Aloqa ma'lumotlari">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Ism</span>
                  <span className="text-gray-800">
                    {request.contactFirstName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Familiya</span>
                  <span className="text-gray-800">
                    {request.contactLastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Telefon</span>
                  <span className="text-gray-800">{request.contactPhone}</span>
                </div>
              </div>
            </Card>

            <Card title="Manzil">
              <p className="text-sm text-gray-700">
                {addressLine || "Manzil ko'rsatilmagan"}
              </p>
            </Card>

            {request.status === "rejected" && request.rejectionReason && (
              <Card title="Rad etish sababi">
                <p className="text-sm text-gray-700">
                  {request.rejectionReason}
                </p>
              </Card>
            )}

            {request.closingNote && (
              <Card title="Izoh">
                <p className="text-sm text-gray-700">{request.closingNote}</p>
              </Card>
            )}

            {request.status === "cancelled" && request.cancelReason && (
              <Card title="Bekor qilish sababi">
                <p className="text-sm text-gray-700">{request.cancelReason}</p>
              </Card>
            )}

            {canCancel && (
              <Button
                variant="danger"
                className="w-full"
                onClick={() =>
                  dispatch(open({ modal: "cancelRequest", data: request }))
                }
              >
                Murojaatni bekor qilish
              </Button>
            )}

            <ModalWrapper
              name="cancelRequest"
              title="Murojaatni bekor qilish"
              description="Haqiqatan ham bu murojaatni bekor qilmoqchimisiz?"
            >
              <CancelRequestForm />
            </ModalWrapper>
          </>
        )}
      </div>
    </div>
  );
};

const CancelRequestForm = ({ _id, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelReason, setCancelReason] = React.useState("");

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await requestsAPI.cancel(_id, {
        cancelReason: cancelReason.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["requests", "my"] });
      close();
      navigate("/requests/my");
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

export default RequestDetailPage;
