// React
import React from "react";

// Toaster
import { toast } from "sonner";

// Icons
import * as Icons from "lucide-react";

// Redux
import { open } from "@/features/modal";
import { useDispatch } from "react-redux";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import { Button } from "@/shared/components/shadcn/button";
import List, { ListItem } from "@/shared/components/ui/List";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import BackHeader from "@/shared/components/layout/BackHeader";

// API
import { servicesAPI, serviceReportsAPI } from "@/shared/api/http";

// Data
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ServicesPage = () => {
  const { openModal } = useModal("serviceDetail");

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const { data: myReports = [] } = useQuery({
    queryKey: ["service-reports", "my"],
    queryFn: () => serviceReportsAPI.getMyReports().then((res) => res.data),
  });

  const getLatestReport = (serviceId) => {
    const reports = myReports.filter((r) => r.service?._id === serviceId);
    return reports.length > 0 ? reports[0] : null;
  };

  const handleServiceClick = (service) => {
    const reports = myReports.filter((r) => r.service?._id === service._id);
    const latestReport = reports.length > 0 ? reports[0] : null;
    openModal("serviceDetail", { service, latestReport });
  };

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/dashboard" title="Xizmatlar" />

      <div className="container space-y-5">
        <ListItem
          title="Arizalarim"
          className="rounded-2xl"
          to="/services/my-reports"
          icon={Icons.ClipboardList}
          gradientTo="to-indigo-700"
          gradientFrom="from-indigo-400"
          description="Barcha arizalar holati"
          trailing={<Icons.ChevronRight strokeWidth={1.5} />}
        />

        {/* Xizmatlar ro'yxati */}
        <List
          items={services.map((service) => {
            const Icon = Icons[service.icon] || Icons.HelpCircle;
            const report = getLatestReport(service._id);
            const status = report
              ? SERVICE_REPORT_STATUSES[report.status]
              : null;

            const isUnavailable = report?.status === "unavailable";
            const isInProgress = ["in_progress", "pending_confirmation"].includes(report?.status);

            return {
              icon: Icon,
              key: service._id,
              title: service.name,
              gradientTo: isUnavailable ? "to-red-700" : isInProgress ? "to-yellow-700" : "to-green-700",
              gradientFrom: isUnavailable ? "from-red-400" : isInProgress ? "from-yellow-400" : "from-green-400",
              onClick: () => handleServiceClick(service),
              trailing: status ? (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  Mavjud
                </span>
              ),
            };
          })}
        />
      </div>

      {/* Xizmat holati modal */}
      <ModalWrapper name="serviceDetail" title="Xizmat holati">
        <ServiceDetailModal />
      </ModalWrapper>

      {/* Bekor qilish modali */}
      <ModalWrapper
        name="cancelReport"
        title="Arizani bekor qilish"
        description="Haqiqatan ham bu arizani bekor qilmoqchimisiz?"
      >
        <CancelReportForm />
      </ModalWrapper>
    </div>
  );
};

const ServiceDetailModal = ({ service, latestReport: initialReport, close }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data: myReports = [] } = useQuery({
    queryKey: ["service-reports", "my"],
    queryFn: () => serviceReportsAPI.getMyReports().then((res) => res.data),
  });

  const latestReport = service
    ? myReports.find((r) => r.service?._id === service._id) || initialReport
    : initialReport;

  const createMutation = useMutation({
    mutationFn: (data) => serviceReportsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-reports", "my"] });
      toast.success("Ariza muvaffaqiyatli yuborildi!");
      close();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, confirmed }) =>
      serviceReportsAPI.confirm(id, { confirmed }),
    onSuccess: (_, { confirmed }) => {
      queryClient.invalidateQueries({ queryKey: ["service-reports", "my"] });
      toast.success(
        confirmed
          ? "Xizmat mavjudligi tasdiqlandi!"
          : "Muammo hali bartaraf etilmagan deb belgilandi",
      );
      close();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  if (!service) return null;

  const Icon = Icons[service.icon] || Icons.HelpCircle;
  const latestStatus = latestReport?.status;

  const canCancel =
    latestReport &&
    !["pending_confirmation", "confirmed", "rejected", "cancelled"].includes(latestStatus);

  const canCreateReport =
    !latestStatus ||
    latestStatus === "confirmed" ||
    latestStatus === "rejected" ||
    latestStatus === "cancelled";

  return (
    <div className="space-y-4">
      <ListItem
        icon={Icon}
        title={service.name}
        gradientTo="to-green-700"
        gradientFrom="from-green-400"
        className="bg-gray-100 rounded-lg"
      />

      {/* Pending */}
      {latestStatus === "pending_confirmation" && (
        <>
          <p className="text-gray-500">
            Admin muammoni bartaraf etilganini bildirdi. Tasdiqlaysizmi?
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3.5 xs:flex-row">
            <Button
              className="w-full"
              onClick={() =>
                confirmMutation.mutate({
                  id: latestReport._id,
                  confirmed: true,
                })
              }
              disabled={confirmMutation.isPending}
            >
              Ha
            </Button>

            <Button
              variant="danger"
              className="w-full"
              onClick={() =>
                confirmMutation.mutate({
                  id: latestReport._id,
                  confirmed: false,
                })
              }
              disabled={confirmMutation.isPending}
            >
              Yo'q
            </Button>
          </div>
        </>
      )}

      {/* In progress */}
      {latestStatus === "in_progress" && (
        <>
          <p className="text-yellow-600">
            Arizangiz jarayonda. Admin ko'rib chiqmoqda.
          </p>

          <Button variant="secondary" className="w-full" onClick={close}>
            Yaxshi
          </Button>
        </>
      )}

      {/* Rejected */}
      {latestStatus === "rejected" && latestReport?.rejectionReason && (
        <div className="space-y-1.5">
          <span className="font-medium text-red-800">Rad etildi:</span>

          {/* Reason */}
          <p className="bg-red-50 rounded-lg p-3 text-red-800">
            {latestReport.rejectionReason}
          </p>
        </div>
      )}

      {/* Create Report */}
      {canCreateReport && (
        <Button
          variant="danger"
          className="w-full"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate({ serviceId: service._id })}
        >
          Mavjud emasga o'zgartirish
          {createMutation.isPending && "..."}
        </Button>
      )}

      {/* Unavailable */}
      {latestStatus === "unavailable" && (
        <p className="text-gray-600">
          Arizangiz adminlarga yuborildi. Natijani kutib turing.
        </p>
      )}

      {/* Cancelled */}
      {latestStatus === "cancelled" && latestReport?.cancelReason && (
        <div className="space-y-1.5">
          <span className="font-medium text-gray-700">
            Bekor qilish sababi:
          </span>
          <p className="bg-gray-50 rounded-lg p-3 text-gray-700">
            {latestReport.cancelReason}
          </p>
        </div>
      )}

      {/* Cancel button */}
      {canCancel && (
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            close();
            dispatch(open({ modal: "cancelReport", data: latestReport }));
          }}
        >
          Arizani bekor qilish
        </Button>
      )}
    </div>
  );
};

const CancelReportForm = ({ _id, close, isLoading, setIsLoading }) => {
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = React.useState("");

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await serviceReportsAPI.cancel(_id, {
        cancelReason: cancelReason.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["service-reports", "my"] });
      close();
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

export default ServicesPage;
