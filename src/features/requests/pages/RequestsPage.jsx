// Components
import List from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

// Data
import { requestCategories } from "@/shared/data/request-categories";

const RequestsPage = () => {
  return (
    <div className="min-h-screen space-y-5 animate__animated animate__fadeIn">
      {/* Header */}
      <BackHeader href="/dashboard" title="Murojaatlar" />

      <div className="container">
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
