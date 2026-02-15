// Icons
import { Pencil } from "lucide-react";

// Router
import { Link } from "react-router-dom";

// API
import { requestsAPI } from "@/shared/api/http";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import List from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";
import { requestCategories } from "@/shared/data/request-categories";

const MyRequestsPage = () => {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", "my"],
    queryFn: () => requestsAPI.getMyRequests().then((res) => res.data),
  });

  const getCategoryLabel = (id) =>
    requestCategories.find((c) => c.id === id)?.label || id;

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      {/* Header */}
      <BackHeader href="/requests" title="Murojaatlarim" />

      <div className="container space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && requests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Hozircha arizalar yo'q</p>
            <Link
              to="/requests"
              className="text-blue-600 hover:underline text-sm"
            >
              Yangi ariza yuborish
            </Link>
          </div>
        )}

        {!isLoading && requests.length > 0 && (
          <List
            items={requests.map((req) => {
              const status = REQUEST_STATUSES[req.status] || {};
              const canEdit = req.status === "pending";

              return {
                key: req._id,
                to: `/requests/${req._id}`,
                description: req.description,
                title: getCategoryLabel(req.category) + " - #" + req._id,
                trailing: canEdit ? (
                  <Link
                    state={{ request: req }}
                    aria-label="Arizani tahrirlash"
                    to={`/requests/edit/${req._id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center justify-center size-6 text-gray-400 hover:text-blue-600"
                  >
                    <Pencil className="size-4" />
                  </Link>
                ) : null,
                subContent: (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded-full ${status.color}`}
                      >
                        {status.label}
                      </span>
                      <span>{formatUzDate(req.createdAt)}</span>
                    </div>

                    {req.status === "rejected" && req.rejectionReason && (
                      <div className="p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">Sabab </span>
                        <p className="line-clamp-2 text-gray-600">
                          {req.rejectionReason}
                        </p>
                      </div>
                    )}

                    {req.closingNote && (
                      <div className="p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">Izoh</span>
                        <p className="line-clamp-2 text-gray-600">
                          {req.closingNote}
                        </p>
                      </div>
                    )}
                  </div>
                ),
              };
            })}
          />
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
