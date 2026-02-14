// Data
import navItems from "../data/nav.data";

// Components
import List from "@/shared/components/ui/List";
import StoriesPanel from "../components/StoriesPanel";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container pt-5 space-y-5">
        {/* Top */}
        <h1 className="text-blue-500 font-bold text-xl">e-Murojaat</h1>

        {/* Stories Panel */}
        <StoriesPanel />

        {/* Nav list */}
        <List
          items={navItems.map((item) => ({
            title: item.label,
            description: item.description,
            icon: item.icon,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
            to: item.to,
          }))}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
