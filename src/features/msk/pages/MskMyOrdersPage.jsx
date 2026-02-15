// Icons
import * as Icons from "lucide-react";

// Router
import { Link } from "react-router-dom";

// API
import { mskAPI } from "@/shared/api/http";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import List from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";

const MskMyOrdersPage = () => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["msk", "orders", "my"],
    queryFn: () => mskAPI.getMyOrders().then((res) => res.data),
  });

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/msk" title="Buyurtmalarim" />

      <div className="container space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">Hozircha buyurtmalar yo'q</p>
            <Link to="/msk" className="text-blue-600 hover:underline text-sm">
              Yangi buyurtma berish
            </Link>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <List
            items={orders.map((order) => {
              const status = MSK_ORDER_STATUSES[order.status] || {};
              const CategoryIcon =
                Icons[order.category?.icon] || Icons.HelpCircle;
              const canEdit = order.status === "pending";

              return {
                key: order._id,
                icon: CategoryIcon,
                to: `/msk/orders/${order._id}`,
                title: order.category?.name,
                description: order.description,
                gradientTo: "to-orange-700",
                gradientFrom: "from-orange-400",
                trailing: canEdit ? (
                  <Link
                    state={{ order }}
                    aria-label="Buyurtmani tahrirlash"
                    to={`/msk/edit/${order._id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="flex items-center justify-center size-6 text-gray-400 hover:text-blue-600"
                  >
                    <Icons.Pencil className="size-4" />
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
                      <span>{formatUzDate(order.createdAt)}</span>
                    </div>

                    {order.status === "rejected" && order.rejectionReason && (
                      <div className="p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">Sabab </span>
                        <p className="line-clamp-2 text-gray-600">
                          {order.rejectionReason}
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

export default MskMyOrdersPage;
