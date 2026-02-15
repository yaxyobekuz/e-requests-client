// Icons
import * as Icons from "lucide-react";

// API
import { mskAPI } from "@/shared/api/http";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import List, { ListItem } from "@/shared/components/ui/List";
import BackHeader from "@/shared/components/layout/BackHeader";

const MskCategoriesPage = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ["msk", "categories"],
    queryFn: () => mskAPI.getCategories().then((res) => res.data),
  });

  return (
    <div className="min-h-screen pb-20 space-y-5 animate__animated animate__fadeIn">
      <BackHeader href="/dashboard" title="MSK" />

      <div className="container space-y-5">
        <ListItem
          icon={Icons.List}
          to="/msk/my-orders"
          title="Buyurtmalarim"
          className="rounded-2xl"
          gradientTo="to-indigo-700"
          gradientFrom="from-indigo-400"
          description="Barcha buyurtmalar holati"
          trailing={<Icons.ChevronRight strokeWidth={1.5} />}
        />

        <List
          className="mb-6"
          items={categories.map((cat) => {
            const Icon = Icons[cat.icon] || Icons.HelpCircle;
            return {
              key: cat._id,
              icon: Icon,
              title: cat.name,
              gradientTo: "to-orange-700",
              gradientFrom: "from-orange-400",
              to: `/msk/new?category=${cat._id}`,
            };
          })}
        />
      </div>
    </div>
  );
};

export default MskCategoriesPage;
