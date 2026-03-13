// Icons
import { Headset } from "lucide-react";

// Components
import List from "@/shared/components/ui/List";
import StoriesPanel from "../components/StoriesPanel";
import BottomNavbar from "@/shared/components/ui/BottomNavbar";

// Data
import { mainNavItems, secondaryNavItems } from "../data/nav.data";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 animate__animated animate__fadeIn">
      <div className="container pt-5 space-y-5">
        {/* Top */}
        <div className="flex items-center justify-between">
          <h1 className="text-blue-500 font-bold text-xl">e-Murojaat</h1>

          <button className="flex items-center justify-center gap-1.5 text-green-500 bg-white size-11 rounded-full font-medium text-sm xs:text-base xs:px-5 xs:w-auto">
            <span className="hidden xs:inline">Yordam</span>
            <Headset strokeWidth={1.5} className="size-5" />
          </button>
        </div>

        {/* Stories Panel */}
        <StoriesPanel />

        {/* Main nav list */}
        <List
          items={mainNavItems.map((item) => ({
            title: item.label,
            description: item.description,
            icon: item.icon,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
            to: item.to,
          }))}
        />

        {/* Secondary nav list */}
        <List
          items={secondaryNavItems.map((item) => ({
            title: item.label,
            description: item.description,
            icon: item.icon,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
            to: item.to,
          }))}
        />

        {/* Navbar */}
        <BottomNavbar />
      </div>
    </div>
  );
};

export default DashboardPage;
