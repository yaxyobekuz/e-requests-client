import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { servicesAPI, serviceReportsAPI } from "@/shared/api/http";
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";
import {
  ArrowLeft,
  Flame,
  Droplets,
  Zap,
  Wifi,
  Thermometer,
  PipetteIcon,
  HelpCircle,
} from "lucide-react";

const ICON_MAP = { Flame, Droplets, Zap, Wifi, Thermometer, PipetteIcon };

const ServicesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesAPI.getAll().then((res) => res.data),
  });

  const { data: myReports = [] } = useQuery({
    queryKey: ["service-reports", "my"],
    queryFn: () => serviceReportsAPI.getMyReports().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => serviceReportsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-reports", "my"] });
      toast.success("Holat xabari yuborildi!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, confirmed }) =>
      serviceReportsAPI.confirm(id, { confirmed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-reports", "my"] });
      toast.success("Javobingiz qabul qilindi!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleToggleStatus = (serviceId) => {
    createMutation.mutate({ serviceId });
  };

  // Servislar bo'yicha eng oxirgi reportni olish
  const getLatestReport = (serviceId) => {
    return myReports.find((r) => r.service?._id === serviceId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Servislar</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-4">
          Kundalik xizmatlar holati. Status o'zgartiring yoki admin javobini
          tasdiqlang.
        </p>

        <div className="space-y-3">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] || HelpCircle;
            const report = getLatestReport(service._id);
            const status = report
              ? SERVICE_REPORT_STATUSES[report.status]
              : null;

            return (
              <div key={service._id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {status && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Agar report "resolved" bo'lsa, tasdiqlash tugmalari */}
                    {report?.status === "resolved" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            confirmMutation.mutate({
                              id: report._id,
                              confirmed: true,
                            })
                          }
                          disabled={confirmMutation.isPending}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() =>
                            confirmMutation.mutate({
                              id: report._id,
                              confirmed: false,
                            })
                          }
                          disabled={confirmMutation.isPending}
                          className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          Rad etish
                        </button>
                      </div>
                    )}

                    {/* Agar hozirgi status "unavailable" bo'lmasa yoki report yo'q bo'lsa */}
                    {(!report ||
                      report.status === "confirmed" ||
                      report.status === "rejected") && (
                      <button
                        onClick={() => handleToggleStatus(service._id)}
                        disabled={createMutation.isPending}
                        className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Mavjud emas
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
