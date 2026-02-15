// Icons
import { ChevronRight, FileText } from "lucide-react";

// Components
import List, { ListItem } from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { requestCategories } from "@/shared/data/request-categories";

const RequestsPage = () => {
  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      {/* Header */}
      <BackHeader href="/dashboard" title="Murojaatlar" />

      <div className="container space-y-5">
        <ListItem
          icon={FileText}
          to="/requests/my"
          title="Murojaatlarim"
          className="rounded-2xl"
          gradientTo="to-indigo-700"
          gradientFrom="from-indigo-400"
          description="Barcha murojaatlar holati"
          trailing={<ChevronRight strokeWidth={1.5} />}
        />

        <List
          className="mb-6"
          items={requestCategories.map((cat) => {
            return {
              key: cat.id,
              icon: cat.icon,
              title: cat.label,
              gradientTo: cat.gradientTo,
              description: cat.description,
              gradientFrom: cat.gradientFrom,
              to: `/requests/new?category=${cat.id}`,
            };
          })}
        />
      </div>
    </div>
  );
};

export default RequestsPage;
