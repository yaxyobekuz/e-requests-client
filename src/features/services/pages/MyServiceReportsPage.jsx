// Icons
import * as Icons from "lucide-react";

// API
import { serviceReportsAPI } from "@/shared/api/http";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import List from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Data
import { SERVICE_REPORT_STATUSES } from "@/shared/data/request-statuses";

const MyServiceReportsPage = () => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["service-reports", "my"],
    queryFn: () => serviceReportsAPI.getMyReports().then((res) => res.data),
  });

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/services" title="Xizmat arizalarim" />

      <div className="container space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="text-center py-12">
            <Icons.InboxIcon className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Hali arizalar mavjud emas</p>
          </div>
        )}

        <List
          items={reports.map((report) => {
            const status = SERVICE_REPORT_STATUSES[report.status] || {};
            const ServiceIcon = Icons[report.service?.icon] || Icons.HelpCircle;
            const isUnavailable = report.status === "unavailable";
            const isInProgress = ["in_progress", "pending_confirmation"].includes(report.status);

            return {
              key: report._id,
              title: report.service?.name,
              description: formatUzDate(report.createdAt),
              icon: ServiceIcon,
              gradientTo: isUnavailable ? "to-red-700" : isInProgress ? "to-yellow-700" : "to-green-700",
              gradientFrom: isUnavailable ? "from-red-400" : isInProgress ? "from-yellow-400" : "from-green-400",
              trailing: (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                >
                  {status.label}
                </span>
              ),
              subContent: (
                <div className="space-y-2">
                  {report.rejectionReason && (
                    <p className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
                      {report.rejectionReason}
                    </p>
                  )}
                  {report.status === "cancelled" && report.cancelReason && (
                    <p className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">
                      {report.cancelReason}
                    </p>
                  )}
                </div>
              ),
            };
          })}
        />
      </div>
    </div>
  );
};

export default MyServiceReportsPage;
